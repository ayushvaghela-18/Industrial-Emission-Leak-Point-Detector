import bcrypt from 'bcryptjs';
import { UserRepository } from '../utils/repository.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS } from '../constants/index.js';

// Standard email validation pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hackathon Demo User Credentials
export const DEMO_USER = {
  id: 'demo-admin-001',
  name: 'EcoForge Admin',
  email: 'admin@ecoforge.ai',
  password: 'password123',
  role: 'admin',
  isDemoUser: true,
};

/**
 * POST /api/auth/register
 * Creates a new user account with hashed password.
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    // 1. Field validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return errorResponse(res, 'Full name is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_NAME');
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return errorResponse(res, 'Please enter a valid work email address', HTTP_STATUS.BAD_REQUEST, 'MISSING_EMAIL');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return errorResponse(res, 'Please enter a valid work email address', HTTP_STATUS.BAD_REQUEST, 'INVALID_EMAIL');
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return errorResponse(
        res,
        'Password must be at least 8 characters in length',
        HTTP_STATUS.BAD_REQUEST,
        'PASSWORD_TOO_SHORT'
      );
    }

    // 2. Duplicate email check
    // Also protect the demo user email from being overwritten
    if (normalizedEmail === DEMO_USER.email) {
      return errorResponse(
        res,
        'An account with this email already exists',
        HTTP_STATUS.CONFLICT,
        'DUPLICATE_EMAIL'
      );
    }

    const existingUser = await UserRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      return errorResponse(
        res,
        'An account with this email already exists',
        HTTP_STATUS.CONFLICT,
        'DUPLICATE_EMAIL'
      );
    }

    // 3. Salt & Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Persist user in database
    const newUser = await UserRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'operator',
      isSyntheticDemo: false,
    });

    // 5. Clean success response (NEVER return password or password hash)
    return successResponse(
      res,
      {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role || 'operator',
        createdAt: newUser.createdAt,
      },
      'Account created successfully',
      HTTP_STATUS.CREATED
    );
  } catch (err) {
    // Handle Mongoose duplicate key error (code 11000) if race condition occurs
    if (err.code === 11000) {
      return errorResponse(
        res,
        'An account with this email already exists',
        HTTP_STATUS.CONFLICT,
        'DUPLICATE_EMAIL'
      );
    }
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticates user credentials (both Demo Mode and registered users).
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return errorResponse(
        res,
        'Email and password are required',
        HTTP_STATUS.BAD_REQUEST,
        'MISSING_CREDENTIALS'
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Hackathon Demo Mode support
    if (normalizedEmail === DEMO_USER.email && password === DEMO_USER.password) {
      return successResponse(
        res,
        {
          user: {
            id: DEMO_USER.id,
            name: DEMO_USER.name,
            email: DEMO_USER.email,
            role: DEMO_USER.role,
            isDemoUser: true,
          },
        },
        'Sign in successful (Demo Mode)',
        HTTP_STATUS.OK
      );
    }

    // 2. Query registered user from database
    const user = await UserRepository.findByEmail(normalizedEmail);
    if (!user) {
      return errorResponse(
        res,
        'Invalid email or password',
        HTTP_STATUS.UNAUTHORIZED,
        'INVALID_CREDENTIALS'
      );
    }

    // 3. Verify password hash using bcryptjs
    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return errorResponse(
        res,
        'Invalid email or password',
        HTTP_STATUS.UNAUTHORIZED,
        'INVALID_CREDENTIALS'
      );
    }

    // 4. Return authenticated user payload
    return successResponse(
      res,
      {
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'operator',
        },
      },
      'Sign in successful',
      HTTP_STATUS.OK
    );
  } catch (err) {
    next(err);
  }
}
