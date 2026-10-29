const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { setAuthCookie, COOKIE_NAME } = require("../middleware/auth");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createUser = async (payload) => {
    const googleId = payload.sub;
    const imageUrl = payload.picture;

    const user = new User({
        googleId,
        name: payload.name,
        email: payload.email,
        picture: imageUrl
    });

    await user.save();
    return user;
};

const handleGoogleRedirect = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication failed" });
    }

    setAuthCookie(res, req.user._id);
    res.status(200).json({ message: "Authentication successful", user: publicUser(req.user) });
};

const publicUser = (user) => ({
    id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    picture: user.picture,
});

const usernamePattern = /^[a-zA-Z0-9._-]{3,32}$/;
const validateCredentials = (username, password) =>
    typeof username === "string" &&
    usernamePattern.test(username) &&
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 128;

const handleRegister = async (req, res) => {
    const { username, password } = req.body;
    if (!validateCredentials(username, password)) {
        return res.status(400).json({
            message: "Username must be 3-32 letters, numbers, dots, underscores, or hyphens; password must be 8-128 characters.",
        });
    }

    try {
        const normalizedUsername = username.toLowerCase();
        const existingUser = await User.findOne({ username: normalizedUsername });
        if (existingUser) return res.status(409).json({ message: "Username is already in use." });

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({
            username: normalizedUsername,
            passwordHash,
            name: normalizedUsername,
        });
        setAuthCookie(res, user._id);
        return res.status(201).json({ message: "Registration successful", user: publicUser(user) });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Unable to complete registration." });
    }
};

const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    if (typeof username !== "string" || typeof password !== "string") {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    try {
        const user = await User.findOne({ username: username.toLowerCase() }).select("+passwordHash");
        const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
        if (!passwordMatches) return res.status(401).json({ message: "Invalid username or password." });

        setAuthCookie(res, user._id);
        return res.status(200).json({ message: "Login successful", user: publicUser(user) });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Unable to complete login." });
    }
};

const handleLogout = (req, res) => {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/" });
    res.status(204).end();
};

const handleMe = (req, res) => res.json({ user: publicUser(req.user) });

const handleGoogleToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token missing" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;

        let user = await User.findOne({ googleId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        setAuthCookie(res, user._id);

        res.status(200).json({
            message: "Authentication successful",
            user: publicUser(user),
        });
    } catch (error) {
        console.error("Google Token Handling Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const handleGoogleRegister = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Token missing" });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const existingUser = await User.findOne({ googleId: payload.sub });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const user = await createUser({
            sub: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
        });

        setAuthCookie(res, user._id);

        res.status(200).json({
            message: "Registration successful",
            user: publicUser(user),
        });
    } catch (error) {
        console.error("Google Register Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    handleGoogleRedirect,
    handleGoogleToken,
    handleGoogleRegister,
    handleRegister,
    handleLogin,
    handleLogout,
    handleMe,
    createUser,
};