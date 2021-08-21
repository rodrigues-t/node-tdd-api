export default class AuthUseCase {
  auth(email: string, password: string): unknown {
    return {
      email,
      password,
    };
  }
}
