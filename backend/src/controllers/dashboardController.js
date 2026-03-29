const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  const userId = req.userId;

  const [total, byStatus, upcomingReminders, recentApplications] = await Promise.all([
    prisma.application.count({ where: { userId } }),
    prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true },
    }),
    prisma.reminder.findMany({
      where: { userId, completed: false, dueDate: { gte: new Date() } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { application: { include: { job: true } } },
    }),
    prisma.application.findMany({
      where: { userId },
      orderBy: { appliedDate: 'desc' },
      take: 5,
      include: { job: true },
    }),
  ]);

  const statusCounts = { APPLIED: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 };
  byStatus.forEach(s => { statusCounts[s.status] = s._count.id; });

  const responseRate = total > 0
    ? Math.round(((statusCounts.INTERVIEW + statusCounts.OFFER) / total) * 100)
    : 0;

  res.json({
    stats: {
      total,
      applied: statusCounts.APPLIED,
      interview: statusCounts.INTERVIEW,
      offer: statusCounts.OFFER,
      rejected: statusCounts.REJECTED,
      responseRate,
    },
    upcomingReminders,
    recentApplications,
  });
};

module.exports = { getStats };
