const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/jobs
const getJobs = async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { title: { contains: search } },
          { company: { contains: search } },
        ],
      }
    : {};

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, skip: Number(skip), take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.job.count({ where }),
  ]);

  res.json({ jobs, total, page: Number(page), totalPages: Math.ceil(total / limit) });
};

// POST /api/jobs
const createJob = async (req, res) => {
  const { title, company, location, description, url, salary } = req.body;
  if (!title || !company) {
    return res.status(400).json({ error: 'Title and company are required' });
  }
  const job = await prisma.job.create({ data: { title, company, location, description, url, salary } });
  res.status(201).json({ job });
};

// GET /api/jobs/:id
const getJob = async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ job });
};

// PUT /api/jobs/:id
const updateJob = async (req, res) => {
  const { title, company, location, description, url, salary } = req.body;
  const job = await prisma.job.update({
    where: { id: req.params.id },
    data: { title, company, location, description, url, salary },
  });
  res.json({ job });
};

// DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  await prisma.job.delete({ where: { id: req.params.id } });
  res.json({ message: 'Job deleted successfully' });
};

module.exports = { getJobs, createJob, getJob, updateJob, deleteJob };
