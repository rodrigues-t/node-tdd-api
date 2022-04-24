import bcrypt from 'bcrypt';
import { MissingParamError } from '../errors';

export default class Encrypter {
  async compare(value: string, hash: string): Promise<boolean> {
    if (!value) {
      throw new MissingParamError('value');
    }

    if (!hash) {
      throw new MissingParamError('hash');
    }

    return bcrypt.compare(value, hash);
  }
}
