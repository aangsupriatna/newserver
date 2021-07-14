import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const createTokens = async (user, secret, expire) => {
  const tokenExpire = expire ? '7d' : '20m';

  const createAccessToken = jwt.sign(
    {
      data: {
        id: user.id, isAdmin: user.isAdmin
      }
    },
    secret,
    { expiresIn: tokenExpire }
  );

  const createRefreshToken = jwt.sign(
    {
      data: { id: user.id }
    }
    ,
    secret,
    { expiresIn: '10d' }
  );

  return Promise.all([createAccessToken, createRefreshToken]);
}

const UserResolver = {
  Query: {
    user: async (parent, { id }, { req }) => {
      if (!req.isAuth) throw Error("Not authorized!");
      return await User.findById(id).exec();
    },
    users: async (parent, input, { req }) => {
      if (!req.isAuth) throw Error("Not authorized!");
      return await User.find({}).exec();
    }
  },

  Mutation: {
    signin: async (parent, { input }, { req }) => {
      const { email, password, expire } = input;
      const user = await User.findOne({ email: email }).exec();
      if (!user) throw Error("User doesn't exists");

      if (!bcrypt.compareSync(password, user.password))
        throw Error("Unable to verify credentials");

      const [accessToken, refreshToken] = await createTokens(user, process.env.JWT_KEY, expire);
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
      } catch (error) {
        throw Error(error);
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
      if (!req.isAuth || !req.user.data.isAdmin) throw Error("Not authorized!");
      const { username, email, password } = input
      try {
        if (username && email && password) {
          return new User(input).save();
        } else {
          throw Error("User data required");
        }
      } catch (error) {
        throw Error(error);
      }
    },
    updateUser: (parent, { input }, { req }) => {
      if (!req.isAuth || !req.user.data.isAdmin) throw Error("Not authorized!");
      return User.findByIdAndUpdate(input.id, input);
    },
    deleteUser: (parent, { id }, { req }) => {
      if (!req.isAuth || !req.user.data.isAdmin) throw Error("Not authorized!");
      return User.findByIdAndRemove(id);
    },
  }
}

export default UserResolver