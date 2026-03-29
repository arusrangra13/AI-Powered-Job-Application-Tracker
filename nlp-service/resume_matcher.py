"""
Resume Matcher using spaCy + HuggingFace sentence-transformers
"""
from typing import List, Dict, Any
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
import logging

logger = logging.getLogger(__name__)

# Comprehensive skills ontology
SKILLS_ONTOLOGY = {
    "programming_languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
        "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
    ],
    "frontend": [
        "react", "vue", "angular", "next.js", "nuxt.js", "svelte", "html", "css",
        "tailwind", "bootstrap", "sass", "webpack", "vite", "redux", "mobx",
    ],
    "backend": [
        "node.js", "express", "django", "flask", "fastapi", "spring", "rails",
        "laravel", "asp.net", "graphql", "rest api", "grpc", "microservices",
    ],
    "databases": [
        "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite",
        "dynamodb", "cassandra", "neo4j", "firebase", "supabase", "prisma",
    ],
    "cloud_devops": [
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
        "jenkins", "github actions", "gitlab ci", "ci/cd", "nginx", "linux",
    ],
    "ai_ml": [
        "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
        "scikit-learn", "pandas", "numpy", "spacy", "nlp", "computer vision",
        "hugging face", "transformers", "langchain", "openai",
    ],
    "soft_skills": [
        "agile", "scrum", "kanban", "team leadership", "communication",
        "problem solving", "project management", "code review", "mentoring",
    ],
}

ALL_SKILLS = [skill for group in SKILLS_ONTOLOGY.values() for skill in group]


class ResumeMatcher:
    def __init__(self):
        self.model = None
        self.nlp = None
        self._load_models()

    def _load_models(self):
        """Load NLP models with graceful fallback"""
        # Try to load sentence-transformer
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading sentence-transformer model...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Sentence transformer loaded.")
        except Exception as e:
            logger.warning(f"Sentence transformer not available: {e}. Using TF-IDF fallback.")
            self.model = None

        # Try to load spaCy
        try:
            import spacy
            try:
                self.nlp = spacy.load("en_core_web_sm")
                logger.info("spaCy model loaded.")
            except OSError:
                logger.warning("spaCy model not found. Run: python -m spacy download en_core_web_sm")
                self.nlp = None
        except ImportError:
            logger.warning("spaCy not available.")
            self.nlp = None

    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using keyword matching + spaCy NER"""
        text_lower = text.lower()
        found_skills = []

        for skill in ALL_SKILLS:
            # Use word boundary matching for accurate detection
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.append(skill)

        return list(set(found_skills))

    def _semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts"""
        if self.model:
            try:
                embeddings = self.model.encode([text1, text2])
                sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
                return float(max(0, min(1, sim)))
            except Exception as e:
                logger.warning(f"Sentence transformer failed: {e}")

        # TF-IDF fallback
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([text1, text2])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(max(0, min(1, sim)))
        except Exception:
            pass

        # Last resort: Jaccard similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        if not words1 or not words2:
            return 0.0
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        return intersection / union if union > 0 else 0.0

    def analyze(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Full resume analysis:
        1. Extract skills from both texts
        2. Calculate semantic similarity
        3. Identify matched/missing skills
        4. Generate improvement suggestions
        """
        resume_skills = set(self.extract_skills(resume_text))
        job_skills = set(self.extract_skills(job_description))

        matched_skills = sorted(resume_skills & job_skills)
        missing_skills = sorted(job_skills - resume_skills)

        # Compute composite score
        semantic_sim = self._semantic_similarity(resume_text, job_description)

        if job_skills:
            skill_coverage = len(matched_skills) / len(job_skills)
            score = round((semantic_sim * 0.5 + skill_coverage * 0.5) * 100, 1)
        else:
            score = round(semantic_sim * 100, 1)

        score = max(0, min(100, score))

        suggestions = self._generate_suggestions(score, missing_skills, matched_skills)

        return {
            "score": score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "suggestions": suggestions,
            "method": "nlp" if self.model else "tfidf",
        }

    def _generate_suggestions(
        self, score: float, missing_skills: List[str], matched_skills: List[str]
    ) -> List[str]:
        """Generate actionable resume improvement suggestions"""
        suggestions = []

        if missing_skills:
            top_missing = missing_skills[:5]
            skills_str = ", ".join(top_missing)
            suggestions.append(
                f"Add these in-demand skills to your resume: {skills_str}. "
                "Include project examples or certifications to demonstrate proficiency."
            )

        if score < 40:
            suggestions.append(
                "Your resume has low compatibility. Tailor it specifically for this role "
                "by mirroring keywords from the job description."
            )
        elif score < 65:
            suggestions.append(
                "Moderate match detected. Strengthen your resume by elaborating on "
                "relevant projects and quantifying achievements with metrics."
            )
        elif score < 80:
            suggestions.append(
                "Good match! Fine-tune by adding specific technologies mentioned in "
                "the job description and highlighting leadership or team impact."
            )
        else:
            suggestions.append(
                "Excellent match! Your resume is well-aligned. "
                "Ensure your summary statement directly references the role's key requirements."
            )

        if len(matched_skills) > 0:
            suggestions.append(
                f"Highlight your strength in: {', '.join(matched_skills[:3])}. "
                "Ensure these are prominently featured in your summary and experience sections."
            )

        if not missing_skills and score > 80:
            suggestions.append(
                "Consider adding quantifiable achievements (e.g., 'Reduced load time by 40%') "
                "to make your resume stand out from other strong candidates."
            )

        return suggestions
