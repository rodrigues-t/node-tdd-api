import { MissingParamError } from '../../utils/errors';

export default class AuthUseCase {
  async auth(email: string, password: string): Promise<string | null> {
    if (!email) {
      throw new MissingParamError('email');
    }

    if (!password) {
      throw new MissingParamError('password');
    }

    return 'any_token';
  }
}
