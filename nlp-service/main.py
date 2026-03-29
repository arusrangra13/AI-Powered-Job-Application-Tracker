"""
AI-Powered Job Application Tracker - NLP Microservice
Uses spaCy and HuggingFace sentence-transformers for resume matching
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
import os

from resume_matcher import ResumeMatcher

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Job Tracker NLP Service",
    description="NLP microservice for resume-job description matching",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize matcher on startup
matcher = None

@app.on_event("startup")
async def startup():
    global matcher
    logger.info("Loading NLP models...")
    matcher = ResumeMatcher()
    logger.info("NLP models loaded successfully!")


class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str


class SkillsRequest(BaseModel):
    text: str


class AnalyzeResponse(BaseModel):
    score: float
    matched_skills: List[str]
    missing_skills: List[str]
    suggestions: List[str]
    method: str = "nlp"


@app.get("/health")
async def health():
    return {"status": "ok", "models_loaded": matcher is not None}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Analyze resume against job description.
    Returns compatibility score, matched/missing skills, and improvement suggestions.
    """
    if not matcher:
        raise HTTPException(status_code=503, detail="NLP models not loaded")

    if not request.resume_text.strip() or not request.job_description.strip():
        raise HTTPException(status_code=400, detail="Both resume_text and job_description are required")

    result = matcher.analyze(request.resume_text, request.job_description)
    return result


@app.post("/extract-skills")
async def extract_skills(request: SkillsRequest):
    """Extract skills from a text using spaCy"""
    if not matcher:
        raise HTTPException(status_code=503, detail="NLP models not loaded")

    skills = matcher.extract_skills(request.text)
    return {"skills": skills}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
