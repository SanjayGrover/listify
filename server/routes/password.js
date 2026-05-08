const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// POST /api/password/forgot
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutes
    await user.save();

    // Build reset URL
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Listify — Reset Your Password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
          <h2 style="color: #4f46e5;">Reset Your Password</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your Listify password. Click the button below to choose a new one.</p>
          <a href="${resetURL}" style="display: inline-block; margin: 1.5rem 0; padding: 0.75rem 1.5rem; background-color: #4f46e5; color: #fff; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 0.85rem;">This link will expire in 30 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// POST /api/password/reset/:token
router.post('/reset/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with valid token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });

    // Update password and clear reset token
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;