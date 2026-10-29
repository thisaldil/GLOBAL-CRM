const User = require("../models/User");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const Invoice = require("../models/Invoice");

//get user details
exports.getUserDetails = async (req, res) => {
    try {
        if (String(req.user._id) !== String(req.params.userId)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        const user = await User.findById(req.params.userId).select("-passwordHash -__v");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        console.error("Error fetching user details:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
