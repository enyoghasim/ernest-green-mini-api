const { Schema, model } = require("mongoose");
const { genSaltSync, hash, compareSync } = require("bcryptjs");
// const axios = require("axios");
// const dotenv = require("dotenv");

const userSchema = new Schema({
  email: String,
  password: String,
});

const hashPasswordMiddleWare = async function (next) {
  const user = this;
  // console.log("hashPasswordMiddleWare", user, user.isModified("password"));
  if (user.isModified("password")) {
    const { password } = user;
    try {
      const salt = genSaltSync(10);
      const hashedPassword = await hash(password, salt);
      user.password = hashedPassword;
      return next();
    } catch (e) {
      const err = new Error(e);
      return next(err);
    }
  }
  next();
};

const hashPasswordOnUpdate = async function (next) {
  const user = this.getUpdate?.()?.$set;
  if (user.password) {
    try {
      const salt = genSaltSync(10);
      const hashedPassword = await hash(user.password, salt);
      this.getUpdate().$set.password = hashedPassword;
      return next();
    } catch (e) {
      const err = new Error(e);
      return next(err);
    }
  }
  next();
};

userSchema.pre("save", hashPasswordMiddleWare);

userSchema.pre("updateOne", hashPasswordOnUpdate);
// hash password on update

userSchema.pre("findOneAndUpdate", hashPasswordOnUpdate);

module.exports = model("Admins", userSchema);
