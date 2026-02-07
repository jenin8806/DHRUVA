import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, role, username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: "Username already exists" });

    user = new User({
      name,
      email,
      role,
      username,
      password,
    });
    await user.save();
    res.status(201).json({ user, token: "dummy-jwt-token" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login with Username/Password
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ user, token: "dummy-jwt-token" }); // In real app, sign JWT
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Link Wallet to User
router.post("/link-wallet", async (req, res) => {
  const { userId, walletAddress } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { walletAddress: walletAddress.toLowerCase() },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get or Create User/Org by Wallet Address (Legacy/Direct Wallet Auth)
router.post("/auth", async (req, res) => {
  const { walletAddress, role } = req.body;

  try {
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        role,
      });
      await user.save();
    } else {
      // Update role if somehow changed or just ensure it matches (optional)
      // Usually role is fixed upon creation, but for flexibility we might allow updates or checks
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update Profile
router.put("/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;
  const updates = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      updates,
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get Profile
router.get("/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
