import { MissingParamError } from '../../utils/errors';
import AuthUseCase from './auth-usecase';

describe('Auth UseCase', () => {
  test('Should throw an error if no email is provided', () => {
    const sut = new AuthUseCase();
    const promise = sut.auth(null as unknown as string, 'any_password');
    expect(promise).rejects.toThrow(new MissingParamError('email'));
  });

  test('Should throw an error if no password is provided', () => {
    const sut = new AuthUseCase();
    const promise = sut.auth('any@email.com', null as unknown as string);
    expect(promise).rejects.toThrow(new MissingParamError('password'));
  });
});
