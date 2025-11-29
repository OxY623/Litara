import pkg from 'graphql-iso-date';
import Mutation from './mutation.js';
import Query from './query.js';
const { GraphQLDateTime } = pkg;

const User = {
  notes: async (parent, args, { prisma }) => {
    return prisma.note.findMany({ where: { authorId: parent.id } });
  },
  favorites: async (parent, args, { prisma }) => {
    return await prisma.note.findMany({
      where: { favoritesBy: { some: { id: parent.id } } },
      orderBy: { id: 'asc' }
    });
  }
};

const Note = {
  author: async (parent, args, { prisma }) => {
    return prisma.user.findUnique({ where: { id: parent.authorId } });
  },
  favoritesBy: async (parent, args, { prisma }) => {
    return prisma.user.findMany({
      where: { favorites: { some: { id: parent.id } } }
    });
  }
};

export const resolvers = {
  Query,
  Mutation,
  User,
  Note,
  DateTime: GraphQLDateTime
};
