import { mocked } from 'ts-jest/dist/utils/testing';
import LoadUserByEmailRepository from '../../infra/repositories/load-user-by-email-repository';
import { MissingParamError } from '../../utils/errors';
import AuthUseCase from './auth-usecase';

const loadSpy = jest.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (email: string): Promise<string> => '',
);

jest.mock('../../infra/repositories/load-user-by-email-repository', () => {
  return jest.fn().mockImplementation(() => {
    return {
      load: loadSpy,
    };
  });
});

const makeSut = () => new AuthUseCase(new LoadUserByEmailRepository());

beforeEach(() => {
  loadSpy.mockClear();
  mocked(LoadUserByEmailRepository).mockClear();
});

describe('Auth UseCase', () => {
  test('Should throw an error if no email is provided', () => {
    const sut = makeSut();
    const promise = sut.auth(null as unknown as string, 'any_password');
    expect(promise).rejects.toThrow(new MissingParamError('email'));
  });

  test('Should throw an error if no password is provided', () => {
    const sut = makeSut();
    const promise = sut.auth('any@email.com', null as unknown as string);
    expect(promise).rejects.toThrow(new MissingParamError('password'));
  });

  test('Should call LoadUserByEmailRepository load method with same email', async () => {
    const sut = makeSut();
    const mockedLoadUserByEmailRepository = mocked(LoadUserByEmailRepository, true);
    await sut.auth('any@email.com', 'any_password');

    expect(mockedLoadUserByEmailRepository).toHaveBeenCalledTimes(1);
    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(loadSpy).toBeCalledWith('any@email.com');
  });
});
