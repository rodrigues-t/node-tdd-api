export default class UnauthorizedError extends Error {
  constructor(paramName: string) {
    super(`Unauthorized`);
    this.name = UnauthorizedError.name;
  }
}
