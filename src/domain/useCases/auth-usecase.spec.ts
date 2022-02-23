import AuthUseCase from './auth-usecase';

describe('Auth UseCase', () => {
  test('Should throw an error if no email is provided', () => {
    const sut = new AuthUseCase();
    const promise = sut.auth(null as unknown as string, 'any_password');
    expect(promise).rejects.toThrow();
  });
});
