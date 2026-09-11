import { HTTP_STATUS } from '../constants/index.js';
import { errorResponse } from '../utils/responseFormatter.js';

/**
 * Global Error Handling Middleware
 * Primary Ownership: Member 2 (Backend & Emissions)
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[EcoForge AI Server Error]', err);

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(
      res,
      `Resource not found with id of ${err.value}`,
      HTTP_STATUS.NOT_FOUND,
      'RESOURCE_NOT_FOUND'
    );
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return errorResponse(
      res,
      'Validation Error',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      'MONGOOSE_VALIDATION_ERROR',
      messages
    );
  }

  return errorResponse(
    res,
    err.message || 'Internal Server Error',
    err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    err.errorCode || 'INTERNAL_ERROR'
  );
};

export default errorHandler;
