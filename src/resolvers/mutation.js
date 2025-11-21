import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import dotenv from 'dotenv';
import getGravatar from '../util/gravatar.js';
import prisma from '../prismaClient.js';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

const Mutation = {
  newNote: async (parent, args, { prisma, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be sighed in to create a note');
    }
    const userExists = await prisma.user.findUnique({
      where: { id: authorId }
    });

    if (!userExists) {
      throw new Error('Author not found');
    }
    if (!args.content.trim()) throw new Error('Note content cannot be empty');

    return await prisma.note.create({
      data: {
        content: args.content,
        authorId: user.id
      },
      include: {
        author: true // подтягиваем автора сразу
      }
    });
  },
  updateNote: async (parent, args, { prisma, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be sighed in to delete a note');
    }
    const note = await prisma.note.findFirst({ where: { id: args.id } });
    if (note && user.id !== note.author.id) {
      throw new ForbiddenError(`You don't have permission to update the note`);
    }
    try {
      return await prisma.note.update({
        where: { id: args.id },
        data: { content: args.content }
      });
    } catch (err) {
      console.error(err);
      throw new Error('Note not found or invalid data');
    }
  },
  deleteNote: async (parent, args, { prisma, user }) => {
    try {
      if (!user) {
        throw new AuthenticationError('You must be sighed in to delete a note');
      }
      const note = await prisma.note.findFirst({ where: id === args.id });
      if (note && user.id !== note.author.id) {
        throw new ForbiddenError(
          `You don't have permission to delete the note`
        );
      }
      await prisma.note.delete({ where: { id: args.id } });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  signUp: async (parent, { username, email, password }, { prisma }) => {
    email = email.trim().toLowerCase();

    const hashed = await bcrypt.hash(password, 10);

    const avatar = getGravatar(email);
    try {
      const user = await prisma.user.create({
        data: {
          username,
          email,
          avatar,
          password: hashed
        }
      });

      return jwt.sign({ id: user.id }, jwtSecret);
    } catch (e) {
      console.error(e);
      throw new Error('Error creating account!!!');
    }
  },
  signIn: async (parent, { username, email, password }, { prisma }) => {
    if (email) email = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }]
      }
    });

    if (!user) {
      throw new AuthenticationError('Error signing in');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new AuthenticationError('Error signing in');
    }

    return jwt.sign({ id: user.id }, jwtSecret);
  },
  toggleFavorite: async (parent, { id }, { prisma, user }) => {
    if (!user) throw new AuthenticationError('Sign in required');

    const note = await prisma.note.findUnique({
      where: { id },
      include: { favoritesBy: true }
    });

    if (!note) throw new Error('Note not found');

    const hasUser = note.favoritesBy.some(u => u.id === user.id);

    return await prisma.note.update({
      where: { id },
      data: {
        favoriteCount: hasUser ? { decrement: 1 } : { increment: 1 },
        favoritesBy: hasUser
          ? { disconnect: { id: user.id } }
          : { connect: { id: user.id } }
      },
      include: { favoritesBy: true }
    });
  }
};

export default Mutation;
