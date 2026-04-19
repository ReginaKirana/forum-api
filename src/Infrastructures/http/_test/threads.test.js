import { describe, expect, it, afterAll, afterEach } from 'vitest';
import supertest from 'supertest';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import JwtTokenManager from '../../security/JwtTokenManager.js';
import jwt from 'jsonwebtoken';

describe('HTTP server for /threads', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: 'secret',
      };

      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual(requestPayload.title);
      expect(response.body.data.addedThread.owner).toEqual(userId);
    });

    it('should respond 401 when missing authentication', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: 'secret',
      };
      const server = await createServer(container);

      // Action
      const response = await supertest(server).post('/threads')
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });

    it('should respond 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
      };

      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should respond 200 and return thread detail', async () => {
      // Arrange
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-123' });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).get(`/threads/${threadId}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toEqual(threadId);
      expect(response.body.data.thread.title).toBeDefined();
      expect(response.body.data.thread.body).toBeDefined();
      expect(response.body.data.thread.date).toBeDefined();
      expect(response.body.data.thread.username).toEqual('dicoding');
      expect(response.body.data.thread.comments).toBeDefined();
      expect(Array.isArray(response.body.data.thread.comments)).toEqual(true);
    });

    it('should respond 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await supertest(server).get('/threads/thread-123');

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should respond 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah comment',
      };

      const userId = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeDefined();
      expect(response.body.data.addedComment.content).toEqual(requestPayload.content);
      expect(response.body.data.addedComment.owner).toEqual(userId);
    });

    it('should respond 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};

      const userId = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond 200 and return success', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should respond 404 when comment not found', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should respond 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah balasan',
      };

      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.data.addedReply.content).toEqual(requestPayload.content);
      expect(response.body.data.addedReply.owner).toEqual(userId);
    });

    it('should respond 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};

      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should respond 200 and return success', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId });

      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should respond 404 when reply not found', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });
  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should respond 200 and return success', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should respond 404 when comment not found', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      const tokenManager = new JwtTokenManager(jwt);
      const accessToken = await tokenManager.createAccessToken({ id: userId });

      const server = await createServer(container);

      // Action
      const response = await supertest(server).put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toBeDefined();
    });
  });
});
