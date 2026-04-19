import express from 'express';
import authMiddleware from '../middlewares/auth.js';

const createThreadsRouter = (handler, container) => {
  const router = express.Router();

  router.post('/', authMiddleware(container), handler.postThreadHandler);
  router.get('/:id', handler.getThreadByIdHandler);
  router.post('/:threadId/comments', authMiddleware(container), handler.postCommentHandler);
  router.delete('/:threadId/comments/:commentId', authMiddleware(container), handler.deleteCommentHandler);
  router.post('/:threadId/comments/:commentId/replies', authMiddleware(container), handler.postReplyHandler);
  router.delete('/:threadId/comments/:commentId/replies/:replyId', authMiddleware(container), handler.deleteReplyHandler);
  router.put('/:threadId/comments/:commentId/likes', authMiddleware(container), handler.putLikeCommentHandler);

  return router;
};

export default createThreadsRouter;
