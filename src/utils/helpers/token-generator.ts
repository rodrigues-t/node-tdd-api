import jwt from 'jsonwebtoken';
import { InvalidParamError } from '../errors';

export default class TokenGenerator {
  secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  async generate(id: string): Promise<string | null> {
    if (!this.secret) {
      throw new InvalidParamError('secret');
    }

    if (!id) {
      throw new InvalidParamError('id');
    }

    return jwt.sign(id, this.secret);
  }
}
