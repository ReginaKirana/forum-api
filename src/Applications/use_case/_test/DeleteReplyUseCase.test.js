import { describe, expect, it, vi } from 'vitest';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';
    const userId = 'user-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailabilityThread = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = vi.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.checkAvailabilityReply = vi.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = vi.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = vi.fn().mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(userId, threadId, commentId, replyId);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(commentId);
    expect(mockReplyRepository.checkAvailabilityReply).toBeCalledWith(replyId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(replyId, userId);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(replyId);
  });
});
