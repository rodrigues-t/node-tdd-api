export default class AuthUseCase {
  async auth(email: string, password: string): Promise<string | null> {
    if (!email) {
      throw new Error();
    }
    return 'any_token';
  }
}
