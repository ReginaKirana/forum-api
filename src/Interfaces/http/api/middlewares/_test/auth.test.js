import { describe, expect, it, vi } from 'vitest';
import authMiddleware from '../auth.js';
import AuthenticationTokenManager from '../../../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../../../../Commons/exceptions/AuthenticationError.js';

describe('authMiddleware', () => {
  it('should throw AuthenticationError when not contain authorization header', async () => {
    // Arrange
    const req = {
      headers: {},
    };
    const res = {};
    const next = vi.fn();
    const mockContainer = {};

    const middleware = authMiddleware(mockContainer);

    // Action
    await middleware(req, res, next);

    // Assert
    expect(next).toBeCalledWith(expect.any(AuthenticationError));
    expect(next.mock.calls[0][0].message).toEqual('Missing authentication');
  });

  it('should throw AuthenticationError when authorization header does not start with Bearer', async () => {
    // Arrange
    const req = {
      headers: {
        authorization: 'Basic token',
      },
    };
    const res = {};
    const next = vi.fn();
    const mockContainer = {};

    const middleware = authMiddleware(mockContainer);

    // Action
    await middleware(req, res, next);

    // Assert
    expect(next).toBeCalledWith(expect.any(AuthenticationError));
    expect(next.mock.calls[0][0].message).toEqual('Missing authentication');
  });

  it('should throw AuthenticationError when token verification fails', async () => {
    // Arrange
    const req = {
      headers: {
        authorization: 'Bearer invalid_token',
      },
    };
    const res = {};
    const next = vi.fn();

    const mockTokenManager = new AuthenticationTokenManager();
    mockTokenManager.verifyAccessToken = vi.fn().mockImplementation(() => Promise.reject(new Error('Invalid token')));

    const mockContainer = {
      getInstance: vi.fn().mockImplementation(() => mockTokenManager),
    };

    const middleware = authMiddleware(mockContainer);

    // Action
    await middleware(req, res, next);

    // Assert
    expect(next).toBeCalledWith(expect.any(AuthenticationError));
    expect(next.mock.calls[0][0].message).toEqual('Missing authentication');
  });

  it('should call next and append req.auth when token is verified successfully', async () => {
    // Arrange
    const req = {
      headers: {
        authorization: 'Bearer valid_token',
      },
    };
    const res = {};
    const next = vi.fn();

    const mockTokenManager = new AuthenticationTokenManager();
    mockTokenManager.verifyAccessToken = vi.fn().mockImplementation(() => Promise.resolve());
    mockTokenManager.decodePayload = vi.fn().mockImplementation(() => Promise.resolve({ id: 'user-123' }));

    const mockContainer = {
      getInstance: vi.fn().mockImplementation(() => mockTokenManager),
    };

    const middleware = authMiddleware(mockContainer);

    // Action
    await middleware(req, res, next);

    // Assert
    expect(mockContainer.getInstance).toBeCalledWith(AuthenticationTokenManager.name);
    expect(mockTokenManager.verifyAccessToken).toBeCalledWith('valid_token');
    expect(mockTokenManager.decodePayload).toBeCalledWith('valid_token');
    expect(req.auth).toEqual({
      credentials: {
        id: 'user-123',
      },
    });
    expect(next).toBeCalledWith();
  });
});
