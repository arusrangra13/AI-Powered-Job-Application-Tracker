const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper: deserialize JSON string fields on resumeAnalysis
function parseAnalysis(ra) {
  if (!ra) return null;
  return {
    ...ra,
    missingSkills: JSON.parse(ra.missingSkillsJson || '[]'),
    suggestions: JSON.parse(ra.suggestionsJson || '[]'),
    matchedSkills: JSON.parse(ra.matchedSkillsJson || '[]'),
  };
}

function withParsedAnalysis(app) {
  if (!app) return app;
  return { ...app, resumeAnalysis: parseAnalysis(app.resumeAnalysis) };
}

// GET /api/applications
const getApplications = async (req, res) => {
  const { status } = req.query;
  const where = { userId: req.userId };
  if (status) where.status = status;

  const applications = await prisma.application.findMany({
    where,
    include: {
      job: true,
      reminders: { where: { completed: false }, orderBy: { dueDate: 'asc' } },
      resumeAnalysis: true,
    },
    orderBy: { appliedDate: 'desc' },
  });

  res.json({ applications: applications.map(withParsedAnalysis) });
};

// POST /api/applications
const createApplication = async (req, res) => {
  const { jobId, notes, appliedDate } = req.body;
  if (!jobId) return res.status(400).json({ error: 'jobId is required' });

  const application = await prisma.application.create({
    data: {
      userId: req.userId,
      jobId,
      notes,
      appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
    },
    include: { job: true },
  });
  res.status(201).json({ application: withParsedAnalysis(application) });
};

// GET /api/applications/:id
const getApplication = async (req, res) => {
  const application = await prisma.application.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: { job: true, reminders: true, resumeAnalysis: true },
  });
  if (!application) return res.status(404).json({ error: 'Application not found' });
  res.json({ application: withParsedAnalysis(application) });
};

// PUT /api/applications/:id
const updateApplication = async (req, res) => {
  const { status, notes } = req.body;
  await prisma.application.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: { status, notes },
  });
  const updated = await prisma.application.findFirst({
    where: { id: req.params.id },
    include: { job: true },
  });
  if (!updated) return res.status(404).json({ error: 'Application not found' });
  res.json({ application: withParsedAnalysis(updated) });
};

// PUT /api/applications/:id/status
const updateStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const updated = await prisma.application.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: { status },
  });
  if (updated.count === 0) return res.status(404).json({ error: 'Application not found' });

  const application = await prisma.application.findFirst({
    where: { id: req.params.id },
    include: { job: true },
  });
  res.json({ application: withParsedAnalysis(application) });
};

// DELETE /api/applications/:id
const deleteApplication = async (req, res) => {
  await prisma.application.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  res.json({ message: 'Application deleted' });
};

module.exports = { getApplications, createApplication, getApplication, updateApplication, updateStatus, deleteApplication };
