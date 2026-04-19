import NewThread from '../../Domains/threads/entities/NewThread.js';

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(userId, useCasePayload) {
    const newThread = new NewThread({ ...useCasePayload, owner: userId });
    return this._threadRepository.addThread(newThread);
  }
}

export default AddThreadUseCase;
