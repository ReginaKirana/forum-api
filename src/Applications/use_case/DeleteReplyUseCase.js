class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(userId, threadId, commentId, replyId) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
    await this._replyRepository.checkAvailabilityReply(replyId);
    await this._replyRepository.verifyReplyOwner(replyId, userId);
    await this._replyRepository.deleteReply(replyId);
  }
}

export default DeleteReplyUseCase;
