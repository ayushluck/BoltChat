import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/util.js';
import { sentWelcomeEmail } from '../emails/emailHandlers.js';
import ENV from '../lib/env.js';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;
    try {
        const trimmedFullname = fullname?.trim();
        const normalizedEmail = email?.toLowerCase().trim();

        if (!trimmedFullname || !normalizedEmail || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!/[a-zA-Z]/.test(trimmedFullname)) {
            return res.status(400).json({ message: "Full name must contain at least one letter" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const user = await User.findOne({
            email: normalizedEmail,
        });
        if (user) {
            return res.status(400).json({ message: "Account with this email already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullname: trimmedFullname,
            email: normalizedEmail,
            password: hashedPassword
        });

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
        try {
            await sentWelcomeEmail(newUser.email, newUser.fullname, ENV.CLIENT_URL);
        } catch (err) {
            console.warn("Signup completed, but welcome email was not sent:", err.message);
        }
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).json({ message: "Server error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const normalizedEmail = email?.toLowerCase().trim();
        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({
            email: normalizedEmail,
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        generateToken(user._id, res);
        res.json({
            _id: user._id,
            fullName: user.fullname,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "Server error" });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Error during logout:", err);
        res.status(500).json({ message: "Server error" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        if (!profilePic) return res.status(400).json({ message: "Profile picture URL is required" });
        const userId = req.user._id;
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true });
        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "Server error" });
    }
}