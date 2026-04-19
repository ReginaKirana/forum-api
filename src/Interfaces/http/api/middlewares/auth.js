import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';

const authMiddleware = (container) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('Missing authentication');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing authentication');
    }

    const token = authHeader.substring(7);

    // We get instance of AuthenticationTokenManager from DI container
    const tokenManager = container.getInstance(AuthenticationTokenManager.name);

    try {
      await tokenManager.verifyAccessToken(token);
    } catch {
      throw new AuthenticationError('Missing authentication');
    }

    const payload = await tokenManager.decodePayload(token);
    req.auth = {
      credentials: {
        id: payload.id, // In starter proj payload usually contains id
      },
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
