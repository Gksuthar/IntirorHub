import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { sendPasswordEmail, sendOtpEmail } from "../utils/emailService.js";
import { generateTemporaryPassword } from "../utils/password.js";

const buildToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "development-secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject({ getters: true });
  delete user.password;
  delete user.otp;
  delete user.otpExpiresAt;
  return user;
};

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const getOtpExpiryDate = () => new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

export const registerAdmin = async (req, res) => {
  try {
    const { email, phone, companyName, password, name } = req.body;

    if (!email || !phone || !companyName || !password) {
      return res.status(400).json({ message: "Email, phone, company name, and password are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const existingPhone = await userModel.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ message: "Phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await userModel.create({
      name,
      email,
      phone,
      companyName,
      password: hashedPassword,
      role: "ADMIN",
      parentId: null,
      isVerified: false,
      otp: otpHash,
      otpExpiresAt: getOtpExpiryDate(),
    });

    await sendOtpEmail({
      to: email,
      name: name || companyName,
      companyName,
      otp,
      context: "registration",
    });

    res.status(201).json({
      message: "Admin registered successfully. Enter the verification code sent to your email.",
      data: {
        email,
        needsVerification: true,
      },
    });
  } catch (error) {
    console.error("registerAdmin error", error);
    res.status(500).json({ message: "Unable to register admin" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Account not verified. Please enter the verification code sent to your email." });
    }

    const token = buildToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("loginUser error", error);
    res.status(500).json({ message: "Unable to login" });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.status(200).json({ user: sanitizeUser(req.user) });
  } catch (error) {
    console.error("getProfile error", error);
    res.status(500).json({ message: "Unable to fetch profile" });
  }
};

export const inviteUser = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admins can invite teammates" });
    }

    const { email, name, role, phone } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    const normalizedRole = role.toUpperCase();
    const allowedRoles = ["MANAGER", "AGENT", "CLIENT"];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: "Role must be Manager, Agent, or Client" });
    }

    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    if (phone) {
      const existingPhone = await userModel.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({ message: "Phone number already exists" });
      }
    }

    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const invitedUser = await userModel.create({
      name,
      email,
      phone: phone || undefined,
      companyName: req.user.companyName,
      password: hashedPassword,
      role: normalizedRole,
      parentId: req.user._id,
      isVerified: true,
    });

    await sendPasswordEmail({
      to: email,
      name: name || normalizedRole,
      password: tempPassword,
      companyName: req.user.companyName,
      role: normalizedRole,
      context: "invitation",
      inviter: req.user.name || req.user.email,
    });

    res.status(201).json({
      message: "User invited successfully",
      user: sanitizeUser(invitedUser),
    });
  } catch (error) {
    console.error("inviteUser error", error);
    res.status(500).json({ message: "Unable to invite user" });
  }
};

export const listCompanyUsers = async (req, res) => {
  try {
    const members = await userModel
      .find({ companyName: req.user.companyName })
      .select("name email role companyName createdAt");

    const payload = members.map((member) => ({
      id: member._id,
      name: member.name || member.email,
      email: member.email,
      role: member.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        member.email || member.name || member.companyName || "User"
      )}`,
      joinedAt: member.createdAt,
    }));

    return res.status(200).json({ users: payload });
  } catch (error) {
    console.error("listCompanyUsers error", error);
    return res.status(500).json({ message: "Unable to fetch users" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const user = await userModel.findOne({ email }).select("+otp +otpExpiresAt");
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (user.isVerified) {
      const token = buildToken(user._id);
      return res.status(200).json({
        message: "Account already verified",
        token,
        user: sanitizeUser(user),
      });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No verification code found. Request a new one." });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Verification code expired. Request a new one." });
    }

    const isValidOtp = await bcrypt.compare(otp, user.otp);
    if (!isValidOtp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save({ validateBeforeSave: false });

    const token = buildToken(user._id);

    res.status(200).json({
      message: "Account verified successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("verifyOtp error", error);
    res.status(500).json({ message: "Unable to verify code" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ email }).select("+otp +otpExpiresAt");
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    const otp = generateOtp();
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiresAt = getOtpExpiryDate();
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail({
      to: user.email,
      name: user.name || user.companyName,
      companyName: user.companyName,
      otp,
      context: "registration",
    });

    res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    console.error("resendOtp error", error);
    res.status(500).json({ message: "Unable to send verification code" });
  }
};

export default {
  registerAdmin,
  loginUser,
  getProfile,
  inviteUser,
  listCompanyUsers,
  verifyOtp,
  resendOtp,
};
