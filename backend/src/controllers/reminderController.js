const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/reminders
const getReminders = async (req, res) => {
  const { completed } = req.query;
  const where = { userId: req.userId };
  if (completed !== undefined) where.completed = completed === 'true';

  const reminders = await prisma.reminder.findMany({
    where,
    include: { application: { include: { job: true } } },
    orderBy: { dueDate: 'asc' },
  });
  res.json({ reminders });
};

// POST /api/reminders
const createReminder = async (req, res) => {
  const { title, description, dueDate, type, applicationId } = req.body;
  if (!title || !dueDate) return res.status(400).json({ error: 'Title and dueDate are required' });

  const reminder = await prisma.reminder.create({
    data: {
      userId: req.userId,
      title,
      description,
      dueDate: new Date(dueDate),
      type: type || 'DEADLINE',
      applicationId: applicationId || null,
    },
    include: { application: { include: { job: true } } },
  });
  res.status(201).json({ reminder });
};

// PUT /api/reminders/:id
const updateReminder = async (req, res) => {
  const { title, description, dueDate, type, completed } = req.body;
  const reminder = await prisma.reminder.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: { title, description, dueDate: dueDate ? new Date(dueDate) : undefined, type, completed },
  });
  if (reminder.count === 0) return res.status(404).json({ error: 'Reminder not found' });
  const updated = await prisma.reminder.findFirst({
    where: { id: req.params.id },
    include: { application: { include: { job: true } } },
  });
  res.json({ reminder: updated });
};

// DELETE /api/reminders/:id
const deleteReminder = async (req, res) => {
  await prisma.reminder.deleteMany({ where: { id: req.params.id, userId: req.userId } });
  res.json({ message: 'Reminder deleted' });
};

// PUT /api/reminders/:id/complete
const completeReminder = async (req, res) => {
  await prisma.reminder.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: { completed: true },
  });
  const reminder = await prisma.reminder.findFirst({ where: { id: req.params.id } });
  res.json({ reminder });
};

module.exports = { getReminders, createReminder, updateReminder, deleteReminder, completeReminder };
