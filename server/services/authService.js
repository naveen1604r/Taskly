import bcrypt from 'bcryptjs';
import userRepository from '../repositories/userRepository.js';
import { generateToken } from '../utils/jwtUtils.js';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidators.js';

/**
 * Sanitize user object to ensure password hashes are never exposed
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url,
    timezone: user.timezone || 'UTC',
    isActive: Boolean(user.is_active),
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
  };
};

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password, timezone = 'UTC' }) => {
  // 1. Validate input
  const validation = validateRegisterInput({ name, email, password });
  if (!validation.isValid) {
    const err = new Error(validation.errors[0]);
    err.statusCode = 400;
    err.errors = validation.errors;
    throw err;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 2. Check for duplicate email
  const existingUser = await userRepository.findUserByEmail(normalizedEmail);
  if (existingUser) {
    const err = new Error('An account with this email address already exists.');
    err.statusCode = 409;
    throw err;
  }

  // 3. Hash password using bcrypt (cost factor 10)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 4. Create user in database
  const newUser = await userRepository.createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    timezone,
  });

  // 5. Generate signed JWT access token
  const token = generateToken(newUser);

  return {
    user: sanitizeUser(newUser),
    token,
  };
};

/**
 * Login existing user
 */
export const loginUser = async ({ email, password }) => {
  // 1. Validate input
  const validation = validateLoginInput({ email, password });
  if (!validation.isValid) {
    const err = new Error(validation.errors[0]);
    err.statusCode = 400;
    err.errors = validation.errors;
    throw err;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 2. Lookup user (with password hash)
  const user = await userRepository.findUserByEmail(normalizedEmail, true);
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  // 3. Check account active status
  if (!user.is_active) {
    const err = new Error('Account is inactive. Please contact administrator.');
    err.statusCode = 403;
    throw err;
  }

  // 4. Compare password with bcrypt
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  // 5. Update last login timestamp asynchronously
  userRepository.updateLastLogin(user.id).catch((e) => {
    console.warn('Failed to update last_login_at:', e.message);
  });

  // 6. Generate signed JWT access token
  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
};

/**
 * Get sanitized profile for an authenticated user
 */
export const getAuthenticatedUser = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Account is inactive.');
    err.statusCode = 403;
    throw err;
  }

  return sanitizeUser(user);
};

export default {
  registerUser,
  loginUser,
  getAuthenticatedUser,
};
