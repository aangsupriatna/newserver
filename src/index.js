import dotenv from 'dotenv';
import { GraphQLServer } from 'graphql-yoga';
import mongoose from 'mongoose';

dotenv.config();

import AuthMiddleware from './middleware/AuthMiddleware.js';
import UserResolver from './schema/UserResolvers.js';
import ProjectResolver from './schema/ProjectResolvers.js';

mongoose.set("useFindAndModify", false);
mongoose.connect(process.env.MONGODB_PATH, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const resolvers = [
  UserResolver,
  ProjectResolver,
]

const context = (req) => ({
  req: req.request,
});

const server = new GraphQLServer({
  typeDefs: `src/schema/Schema.graphql`,
  resolvers,
  context,
});

// server.express.use((req, res, next) => {
//   res.header('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');
//   next();
// })
// Auth middleware
server.express.use(AuthMiddleware);

// Options
const opts = {
  port: 4000,
  cors: {
    credentials: true,
    origin: ['http://localhost:3000']
  }
};

mongoose.connection.once("open", function () {
  server.start(opts, () => console.log(`Server is running on http://localhost:${opts.port}`))
});