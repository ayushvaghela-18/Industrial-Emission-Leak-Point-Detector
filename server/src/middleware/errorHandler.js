import { HTTP_STATUS } from '../constants/index.js';
import { errorResponse } from '../utils/responseFormatter.js';

/**
 * Global Error Handling Middleware
 * Primary Ownership: Member 2 (Backend & Emissions)
 */
export const errorHandler = (err, req, res, next) => {
  // Malformed JSON payload from express.json()
  if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400) && 'body' in err) {
    return errorResponse(
      res,
      'Malformed JSON payload in request body.',
      HTTP_STATUS.BAD_REQUEST,
      'MALFORMED_JSON',
      err.message
    );
  }

  // CORS policy rejection
  if (err.message && err.message.includes('Blocked by CORS policy')) {
    return errorResponse(
      res,
      err.message,
      HTTP_STATUS.FORBIDDEN,
      'CORS_FORBIDDEN'
    );
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(
      res,
      `Resource not found with id of '${err.value}'`,
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

  console.error('[EcoForge AI Server Error]', err);

  const statusCode = err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  return errorResponse(
    res,
    err.message || 'Internal Server Error',
    statusCode,
    err.errorCode || 'INTERNAL_ERROR'
  );
};

export default errorHandler;
