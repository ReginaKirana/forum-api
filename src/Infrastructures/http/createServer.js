import express from 'express';
import ClientError from '../../Commons/exceptions/ClientError.js';
import DomainErrorTranslator from '../../Commons/exceptions/DomainErrorTranslator.js';
import users from '../../Interfaces/http/api/users/index.js';
import authentications from '../../Interfaces/http/api/authentications/index.js';
import threads from '../../Interfaces/http/api/threads/index.js';
import rateLimit from 'express-rate-limit';

const createServer = async (container) => {
  const app = express();

  // Middleware for parsing JSON
  app.use(express.json());

  app.set('trust proxy', 1);

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 90, // Limit each IP to 90 requests per windowMs
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json({
        status: 'fail',
        message: options.message,
      });
    },
    message: 'Melebihi batas permintaan, silakan coba lagi nanti.',
  });
  // Register routes
  app.use('/users', users(container));
  app.use('/authentications', authentications(container));
  
  // Menerapkan Rate Limiter HANYA pada route /threads dan turunannya
  app.use('/threads', apiLimiter, threads(container));

  // Global error handler
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    // bila response tersebut error, tangani sesuai kebutuhan
    const translatedError = DomainErrorTranslator.translate(error);

    // penanganan client error secara internal.
    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
    }

    // penanganan server error sesuai kebutuhan
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'Route not found',
    });
  });

  return app;
};

export default createServer;
