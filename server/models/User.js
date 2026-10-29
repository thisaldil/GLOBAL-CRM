const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    googleId: { type: String, unique: true, sparse: true },
    username: { type: String, unique: true, sparse: true, trim: true, minlength: 3, maxlength: 32 },
    passwordHash: { type: String, select: false },
    name: { type: String },
    email: { type: String, unique: true },
    picture: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
