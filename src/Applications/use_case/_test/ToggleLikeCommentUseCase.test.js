import { vi, describe, it, expect } from 'vitest';
import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrate the add like action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.checkAvailabilityThread = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeExists = vi.fn().mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = vi.fn().mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await toggleLikeCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.verifyLikeExists).toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockLikeRepository.addLike).toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
  });

  it('should orchestrate the delete like action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.checkAvailabilityThread = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeExists = vi.fn().mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = vi.fn().mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await toggleLikeCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.verifyLikeExists).toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
    expect(mockLikeRepository.deleteLike).toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
  });
});
