import Project from '../models/Project.js'

export default {
  Query: {
    project(parent, { id }, { req }) {
      if (!req.isAuth) throw Error("Not authorized!")
      return Project.findById(id);
    },
    projects(parent, { input }, { req }) {
      if (!req.isAuth) throw Error("Not authorized!")
      return Project.find({});
    }
  },
  Mutation: {
    addProject(parent, { input }, { req }) {
      if (!req.isAuth || req.user.roles !== "ADMIN") throw Error("Not authorized!")
      return new Project(input).save();
    },
    editProject(parent, { input }, { req }) {
      if (!req.isAuth || req.user.roles !== "ADMIN") throw Error("Not authorized!")
      return Project.findByIdAndUpdate(input.id, input);
    },
    removeProject(parent, { id }, { req }) {
      if (!req.isAuth || req.user.roles !== "ADMIN") throw Error("Not authorized!")
      return Project.findByIdAndRemove(id)
    },
  }
}
