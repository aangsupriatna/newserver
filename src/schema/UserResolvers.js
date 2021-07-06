import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const UserResolver = {
  Query: {
    isLogin: (parent, args, { req }) => {
      return req.isAuth
    },
    user: (parent, { id }, { req }) => {
      if (!req.isAuth) throw Error("Not authorized!")
      return User.findById(id).exec();
    },
    users: (parent, input, context) => {
      if (!context.req.isAuth) throw Error("Not authorized!")
      return User.find({}).exec();
    }
  },

  Mutation: {
    login: async (parent, { input }, { context }) => {
      const { email, password } = input;
      const user = await User.findOne({ email: email }).exec();

      if (!user) throw Error("User doesn't exists");

      if (!bcrypt.compareSync(password, user.password))
        throw Error("Unable to verify credentials");

      const token = jwt.sign(
        { email, roles: user.roles },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
      );

      return token;
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