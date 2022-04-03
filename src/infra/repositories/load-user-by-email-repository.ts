import User from '../../domain/models/user';

export default class LoadUserByEmailRepository {
  async load(email: string): Promise<User | null> {
    return {
      id: 1,
      email,
      password: 'hashed_password',
    };
  }
}
