export default class AuthUseCase {
  async auth(email: string, password: string): Promise<string | null> {
    return 'any_token';
  }
}
