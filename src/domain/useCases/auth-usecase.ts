import LoadUserByEmailRepository from '../../infra/repositories/load-user-by-email-repository';
import { MissingParamError } from '../../utils/errors';
import Encrypter from '../../utils/helpers/encrypter';
import TokenGenerator from '../../utils/helpers/token-generator';

export default class AuthUseCase {
  loadUserByEmailRepository: LoadUserByEmailRepository;
  encrypter: Encrypter;
  tokenGenerator: TokenGenerator;

  constructor(
    loadUserByEmailRepository: LoadUserByEmailRepository,
    encrypter: Encrypter,
    tokenGenerator: TokenGenerator,
  ) {
    this.loadUserByEmailRepository = loadUserByEmailRepository;
    this.encrypter = encrypter;
    this.tokenGenerator = tokenGenerator;
  }

  async auth(email: string, password: string): Promise<string | null> {
    if (!email) {
      throw new MissingParamError('email');
    }

    if (!password) {
      throw new MissingParamError('password');
    }

    const user = await this.loadUserByEmailRepository.load(email);
    const isValid = user ? await this.encrypter.compare(password, user.password) : false;

    if (user && isValid) {
      return this.tokenGenerator.generate(user.id);
    }

    return null;
  }
}
