import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

const Query = {
  users: async (parent, args, { prisma, user }) => {
    return await prisma.user.findMany();
  },
  user: async (parent, { username }, { prisma, user }) => {
    return prisma.user.findFirst({ where: { username: username } });
  },
  me: async (parent, args, { prisma, user }) => {
    if (!user) throw new AuthenticationError('Not authenticated');
    return prisma.user.findUnique({ where: { id: user.id } });
  },

  notes: async (parent, args, { prisma }) => {
    return prisma.note.findMany({
      include: { author: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  },
  note: async (parent, { id }, { prisma }) => {
    const note = await prisma.note.findUnique({
      where: { id: id },
      include: { author: true }
    });
    if (!note) throw new Error('Note not found');
    return note;
  },
  noteFeed: async (parent, { cursor }, { prisma }) => {
    const limit = 10;

    const whereCondition = cursor ? { id: { lt: cursor } } : {};

    let notes = await prisma.note.findMany({
      where: whereCondition,
      orderBy: { id: 'desc' },
      take: limit + 1
    });

    let hasNextPage = false;

    if (notes.length > limit) {
      hasNextPage = true;
      notes = notes.slice(0, limit);
    }

    const newCursor = notes.length > 0 ? notes[notes.length - 1].id : null;

    return {
      notes,
      cursor: newCursor,
      hasNextPage
    };
  }
};

export default Query;
