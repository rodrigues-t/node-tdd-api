import bcrypt from 'bcrypt';

export default class Encrypter {
  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
