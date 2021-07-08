import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const createTokens = async (user, secret) => {
  const createAccessToken = jwt.sign(
    {
      user: {
        id: user.id, isAdmin: user.isAdmin
      }
    },
    secret,
    { expiresIn: '20m' }
  );

  const createRefreshToken = jwt.sign(
    {
      user: { id: user.id }
    }
    ,
    secret,
    { expiresIn: '7d' }
  );

  return Promise.all([createAccessToken, createRefreshToken]);
}

const UserResolver = {
  Query: {
    isSignin: (parent, args, { req }) => {
      return req.isAuth
    },
    user: async (parent, { id }, { req }) => {
      if (!req.isAuth) throw Error("Not authorized!")
      return await User.findById(id).exec();
    },
    users: async (parent, input, context) => {
      if (!context.req.isAuth) throw Error("Not authorized!")
      return await User.find({}).exec();
    }
  },

  Mutation: {
    signin: async (parent, { input }, { context }) => {
      const { email, password } = input;
      const user = await User.findOne({ email: email }).exec();

      // if (!user) throw Error("User doesn't exists");
      if (!user) {
        return {}
      }

      if (!bcrypt.compareSync(password, user.password))
        throw Error("Unable to verify credentials");

      const [accessToken, refreshToken] = await createTokens(user, process.env.JWT_KEY);
      return {
        accessToken,
        refreshToken,
      };
    },
    refreshTokens: async (parent, { token }, { context }) => {
      let userId = -1
      try {
        const { user: { id } } = await jwt.verify(token, process.env.JWT_KEY);
        userId = id
      } catch (error) {
        return {}
      }
      const user = await User.findById(userId).exec();
      const [newAccessToken, newRefreshToken] = await createTokens(user, process.env.JWT_KEY);
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user
      }
    },
    addUser: (parent, { input }, { req }) => {
      if (!req.isAuth || req.user.roles !== "ADMIN") throw Error("Not authorized!")
      return new User(input).save();
    },
    updateUser: (parent, { input }, { req }) => {
      console.log(req.user)
      if (!req.isAuth || req.user.roles !== "ADMIN") throw Error("Not authorized!")
      return User.findByIdAndUpdate(input.id, input);
    },
    deleteUser: (parent, { id }, { req }) => {
      if (!req.isAuth || req.user.roles !== "ADMIN") throw new Error("Not authorized!")
      return User.findByIdAndRemove(id);
    },
  }
}

export default UserResolver