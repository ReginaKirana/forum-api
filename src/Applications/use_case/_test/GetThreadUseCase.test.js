/* eslint-disable camelcase */
import { describe, expect, it, vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import GetThreadUseCase from '../GetThreadUseCase.js';

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockThread = {
      id: threadId,
      title: 'dicoding',
      body: 'secret',
      date: '2023-01-01',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'dicoding',
        date: '2023-01-01',
        content: 'content',
        is_delete: false,
        likeCount: 2,
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        date: '2023-01-02',
        content: 'content 2',
        is_delete: true,
        likeCount: 0,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-1',
        comment_id: 'comment-1',
        username: 'dicoding',
        date: '2023-01-01',
        content: 'reply',
        is_delete: false,
      },
      {
        id: 'reply-2',
        comment_id: 'comment-1',
        username: 'dicoding',
        date: '2023-01-02',
        content: 'reply 2',
        is_delete: true,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.checkAvailabilityThread = vi.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = vi.fn().mockImplementation(() => Promise.resolve(mockThread));

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = vi.fn().mockImplementation(() => Promise.resolve(mockComments));

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getRepliesByThreadId = vi.fn().mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(threadId);

    // Assert
    expect(thread).toStrictEqual({
      ...mockThread,
      comments: [
        {
          id: 'comment-1',
          username: 'dicoding',
          date: '2023-01-01',
          content: 'content',
          likeCount: 2,
          replies: [
            {
              id: 'reply-1',
              username: 'dicoding',
              date: '2023-01-01',
              content: 'reply',
            },
            {
              id: 'reply-2',
              username: 'dicoding',
              date: '2023-01-02',
              content: '**balasan telah dihapus**',
            },
          ],
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: '2023-01-02',
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [],
        },
      ],
    });

    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(threadId);
  });
});

