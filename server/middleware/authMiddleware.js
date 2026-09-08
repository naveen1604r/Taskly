import { verifyToken } from '../utils/jwtUtils.js';
import userRepository from '../repositories/userRepository.js';

/**
 * JWT Authentication Middleware
 * Protects routes by validating Bearer tokens and attaching req.user
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing.',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      const message =
        jwtError.name === 'TokenExpiredError'
          ? 'Authentication token has expired. Please log in again.'
          : 'Invalid authentication token.';
      return res.status(401).json({
        success: false,
        message,
        code: jwtError.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      });
    }

    // Look up user from database
    const user = await userRepository.findUserById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Access denied.',
      });
    }

    // Attach sanitized user to request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      timezone: user.timezone,
      createdAt: user.created_at,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default requireAuth;
