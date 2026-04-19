import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';
import pool from '../../database/postgres/pool.js';
import CommentLikesTableTestHelper from '../../../../tests/CommentLikesTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import { describe, it, expect, afterEach, afterAll, beforeAll } from 'vitest';

describe('LikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist like and return correctly', async () => {
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.addLike('comment-123', 'user-123');

      const likes = await CommentLikesTableTestHelper.findLike({ commentId: 'comment-123', owner: 'user-123' });
      expect(likes).toHaveLength(1);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like correctly', async () => {
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      await likeRepositoryPostgres.deleteLike('comment-123', 'user-123');

      const likes = await CommentLikesTableTestHelper.findLike({ commentId: 'comment-123', owner: 'user-123' });
      expect(likes).toHaveLength(0);
    });
  });

  describe('verifyLikeExists function', () => {
    it('should return true if like exists', async () => {
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const exists = await likeRepositoryPostgres.verifyLikeExists('comment-123', 'user-123');
      expect(exists).toEqual(true);
    });

    it('should return false if like does not exist', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const exists = await likeRepositoryPostgres.verifyLikeExists('comment-123', 'user-123');
      expect(exists).toEqual(false);
    });
  });
});
