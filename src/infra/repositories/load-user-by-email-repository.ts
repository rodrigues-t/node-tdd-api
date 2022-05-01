import User from '../../domain/models/user';

export default class LoadUserByEmailRepository {
  async load(email: string): Promise<User | null> {
    return {
      id: 'id',
      email,
      password: 'hashed_password',
    };
  }
}
