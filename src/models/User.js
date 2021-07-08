import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const Schema = mongoose.Schema;

const UserSchema = Schema({
  username: { type: String, unique: true, required: true, dropDups: true },
  email: { type: String, unique: true, required: true, dropDups: true },
  password: String,
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  const user = this;
  user.password = await hashPassword(user.password);
});

UserSchema.pre('findOneAndUpdate', async function (next) {
  const user = this;
  if (user._update.password) {
    user._update.password = await hashPassword(user._update.password);
  }
});

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt)
};

export default mongoose.model("User", UserSchema);