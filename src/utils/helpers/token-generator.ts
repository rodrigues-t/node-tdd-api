export default class TokenGenerator {
  secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  async generate(id: number): Promise<string> {
    return '';
  }
}
