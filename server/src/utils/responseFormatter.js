import { HTTP_STATUS } from '../constants/index.js';

/**
 * Standardized API Response Helpers
 * Primary Ownership: Member 2 (Backend & Emissions)
 */

export const successResponse = (res, data, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message = 'An unexpected error occurred',
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errorCode = 'INTERNAL_ERROR',
  details = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    details,
  });
};
