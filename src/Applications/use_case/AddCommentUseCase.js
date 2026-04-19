import NewComment from '../../Domains/comments/entities/NewComment.js';

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(userId, threadId, useCasePayload) {
    await this._threadRepository.checkAvailabilityThread(threadId);

    const newComment = new NewComment({ ...useCasePayload, threadId, owner: userId });
    return this._commentRepository.addComment(newComment);
  }
}

export default AddCommentUseCase;
