const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// POST /api/analyze/resume
const analyzeResume = async (req, res) => {
  const { resumeText, jobDescription, applicationId } = req.body;

  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: 'resumeText and jobDescription are required' });
  }

  let nlpResult;

  try {
    const nlpResponse = await axios.post(`${process.env.NLP_SERVICE_URL}/analyze`, {
      resume_text: resumeText,
      job_description: jobDescription,
    }, { timeout: 30000 });

    nlpResult = nlpResponse.data;
  } catch (err) {
    // Fallback: simple keyword-based analysis if NLP service is unavailable
    console.warn('NLP service unavailable, using fallback analysis');
    nlpResult = fallbackAnalysis(resumeText, jobDescription);
  }

  // Save to DB if applicationId provided
  if (applicationId) {
    const existing = await prisma.resumeAnalysis.findUnique({ where: { applicationId } });
    const analysisData = {
      resumeText,
      compatibilityScore: nlpResult.score,
      missingSkillsJson: JSON.stringify(nlpResult.missing_skills || []),
      suggestionsJson: JSON.stringify(nlpResult.suggestions || []),
      matchedSkillsJson: JSON.stringify(nlpResult.matched_skills || []),
    };
    if (existing) {
      await prisma.resumeAnalysis.update({ where: { applicationId }, data: analysisData });
    } else {
      await prisma.resumeAnalysis.create({ data: { applicationId, ...analysisData } });
    }
  }

  res.json(nlpResult);
};

// Simple keyword-based fallback when Python NLP service is offline
function fallbackAnalysis(resumeText, jobDescription) {
  const SKILLS = [
    'javascript', 'typescript', 'python', 'java', 'react', 'node.js', 'nodejs',
    'express', 'django', 'flask', 'sql', 'postgresql', 'mysql', 'mongodb',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'linux', 'rest api',
    'graphql', 'redis', 'css', 'html', 'tailwind', 'vue', 'angular', 'next.js',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'pandas', 'numpy', 'spacy', 'nlp', 'ci/cd', 'agile', 'scrum',
  ];

  const resumeLower = resumeText.toLowerCase();
  const descLower = jobDescription.toLowerCase();

  const jobSkills = SKILLS.filter(s => descLower.includes(s));
  const matchedSkills = jobSkills.filter(s => resumeLower.includes(s));
  const missingSkills = jobSkills.filter(s => !resumeLower.includes(s));

  const score = jobSkills.length > 0
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 50;

  const suggestions = missingSkills.slice(0, 5).map(skill =>
    `Consider adding experience with ${skill} to your resume to better match this job.`
  );

  if (score < 50) {
    suggestions.push('Your resume needs significant improvement to match this job description. Focus on the missing skills above.');
  } else if (score < 75) {
    suggestions.push('Your resume partially matches the job requirements. Highlight more relevant experience.');
  }

  return {
    score,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    suggestions,
    method: 'fallback',
  };
}

module.exports = { analyzeResume };
