import { mocked } from 'ts-jest/utils';
import AuthUseCase from '../../domain/useCases/auth-usecase';
import MissingParamError from '../errors/missing-param-error';
import LoginRouter from './login-router';

const authSpy = jest.fn((email: string, password: string) => {
  return { email, password };
});

jest.mock('../../domain/useCases/auth-usecase', () => {
  return jest.fn().mockImplementation(() => {
    return {
      auth: authSpy,
    };
  });
});

beforeEach(() => {
  mocked(AuthUseCase).mockClear();
});

const makeSut = () => {
  const authUseCase = new AuthUseCase();
  const sut = new LoginRouter(authUseCase);

  return {
    authUseCase,
    sut,
  };
};

describe('Login Router', () => {
  test('should return 400 if no email is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        password: '123456',
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('email'));
  });

  test('should return 400 if no password is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'ozzy@sabbath.co.uk',
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });

  test('should execute AuthUseCase with correct params', () => {
    const { sut } = makeSut();
    const mockedAuthUseCase = mocked(AuthUseCase, true);
    const HttpRequest = {
      body: {
        email: 'iommi@sabbath.co.uk',
        password: '123456',
      },
    };
    sut.route(HttpRequest);
    expect(mockedAuthUseCase).toHaveBeenCalledTimes(1);
    expect(authSpy).toHaveBeenCalledTimes(1);
    expect(authSpy).toHaveBeenCalledWith(
      HttpRequest.body.email,
      HttpRequest.body.password,
    );
  });
});
