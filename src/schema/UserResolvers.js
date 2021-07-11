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
    user: async (parent, { id }, { req }) => {
      if (!req.isAuth) throw Error("Not authorized!")
      return await User.findById(id).exec();
    },
    users: async (parent, input, { req }) => {
      // console.log(req.error)
      // if (!context.req.isAuth) throw Error("Not authorized!")
      return await User.find({}).exec();
    }
  },

  Mutation: {
    signin: async (parent, { input }, { req }) => {
      const { email, password } = input;
      // console.log(req.error)
      const user = await User.findOne({ email: email }).exec();

      if (!user) throw Error("User doesn't exists");

      if (!bcrypt.compareSync(password, user.password))
        throw Error("Unable to verify credentials");

      const [accessToken, refreshToken] = await createTokens(user, process.env.JWT_KEY);
      return {
        accessToken,
        refreshToken,
      };
    },
    refreshLogin: async (parent, { refreshToken }, { context }) => {
      let userId = -1
      try {
        const { user: { id } } = await jwt.verify(refreshToken, process.env.JWT_KEY);
        userId = id
        console.log(userId)
      } catch (err) {
        throw Error(err)
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