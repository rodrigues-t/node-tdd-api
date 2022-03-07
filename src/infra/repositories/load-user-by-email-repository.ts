export default class LoadUserByEmailRepository {
  async load(email: string): Promise<string> {
    return email;
  }
}
