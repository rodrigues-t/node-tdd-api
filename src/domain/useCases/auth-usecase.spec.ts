import { mocked } from 'ts-jest/dist/utils/testing';
import LoadUserByEmailRepository from '../../infra/repositories/load-user-by-email-repository';
import { MissingParamError } from '../../utils/errors';
import Encrypter from '../../utils/helpers/encrypter';
import TokenGenerator from '../../utils/helpers/token-generator';
import User from '../models/user';
import AuthUseCase from './auth-usecase';

const loadSpy = jest.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (email: string): Promise<User | null> => ({
    id: 1,
    email,
    password: 'hashed_password',
  }),
);

jest.mock('../../infra/repositories/load-user-by-email-repository', () => {
  return jest.fn().mockImplementation(() => {
    return {
      load: loadSpy,
    };
  });
});

const compareSpy = jest.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (password: string, hashedPassword: string): Promise<boolean> => true,
);

jest.mock('../../utils/helpers/encrypter', () => {
  return jest.fn().mockImplementation(() => {
    return {
      compare: compareSpy,
    };
  });
});

const generateSpy = jest.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (id: number): Promise<string> => 'access_token',
);

jest.mock('../../utils/helpers/token-generator', () => {
  return jest.fn().mockImplementation(() => {
    return {
      generate: generateSpy,
    };
  });
});

const makeSut = () => new AuthUseCase(new LoadUserByEmailRepository(), new Encrypter(), new TokenGenerator(''));

beforeEach(() => {
  loadSpy.mockClear();
  mocked(LoadUserByEmailRepository).mockClear();
  compareSpy.mockClear();
  mocked(Encrypter).mockClear();
  generateSpy.mockClear();
  mocked(TokenGenerator).mockClear();
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

  test('Should return null if an invalid email is provided', async () => {
    const sut = makeSut();
    loadSpy.mockResolvedValueOnce(null);
    const accessToken = await sut.auth('invalid@email.com', 'any_password');
    expect(accessToken).toBeNull();
  });

  test('Should return null if an invalid pasword is provided', async () => {
    const sut = makeSut();
    compareSpy.mockResolvedValueOnce(false);
    const accessToken = await sut.auth('valid@email.com', 'invalid_password');
    expect(accessToken).toBeNull();
  });

  test('Should not return null if LoadUserByEmailRepository return valid user', async () => {
    const sut = makeSut();
    const mockedLoadUserByEmailRepository = mocked(LoadUserByEmailRepository, true);
    await sut.auth('valid@email.com', 'any_password');
    expect(mockedLoadUserByEmailRepository).not.toBeNull();
  });

  test('Should call Encrypter with same values', async () => {
    const sut = makeSut();
    const mockedEncrypter = mocked(Encrypter, true);
    await sut.auth('valid@email.com', 'any_password');

    expect(mockedEncrypter).toHaveBeenCalledTimes(1);
    expect(compareSpy).toBeCalledWith('any_password', 'hashed_password');
  });

  test('Should call TokenGenerator with same user id', async () => {
    const sut = makeSut();

    const mockedUser = {
      id: 100,
      email: '',
      password: '',
    };

    loadSpy.mockResolvedValueOnce(mockedUser);

    const mockedTokenGenerator = mocked(TokenGenerator, true);
    await sut.auth('valid@email.com', 'valid_password');

    expect(mockedTokenGenerator).toHaveBeenCalledTimes(1);
    expect(generateSpy).toBeCalledWith(mockedUser.id);
  });

  test('Should return access token if correct crendentials are provided', async () => {
    const sut = makeSut();
    generateSpy.mockResolvedValueOnce('mocked_access_token');
    const accessToken = await sut.auth('valid@email.com', 'valid_password');
    expect(accessToken).toBe('mocked_access_token');
  });
});
