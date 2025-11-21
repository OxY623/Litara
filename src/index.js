import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './schema.js';
import { resolvers } from './resolvers/index.js';
import prisma from './prismaClient.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-validation-complexity';

dotenv.config();

const getUser = token => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      new Error('Session invalid');
    }
  }
};

const app = express();
app.use(helmet());
app.use(cors());
const port = process.env.PORT || 4000;

// ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    const user = getUser(token);
    console.log(user);
    return { prisma, user };
  }
});

//await server.start();
server.applyMiddleware({ app, path: '/api' });

app.listen(port, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);
