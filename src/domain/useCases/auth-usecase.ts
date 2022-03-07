import LoadUserByEmailRepository from '../../infra/repositories/load-user-by-email-repository';
import { MissingParamError } from '../../utils/errors';

export default class AuthUseCase {
  loadUserByEmailRepository: LoadUserByEmailRepository;

  constructor(loadUserByEmailRepository: LoadUserByEmailRepository) {
    this.loadUserByEmailRepository = loadUserByEmailRepository;
  }

  async auth(email: string, password: string): Promise<string | null> {
    if (!email) {
      throw new MissingParamError('email');
    }

    if (!password) {
      throw new MissingParamError('password');
    }

    await this.loadUserByEmailRepository.load(email);

    return 'any_token';
  }
}
