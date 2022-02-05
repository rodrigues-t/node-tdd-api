import { mocked } from 'jest-mock';
import AuthUseCase from '../../domain/useCases/auth-usecase';
import MissingParamError from '../errors/missing-param-error';
import ServerError from '../errors/server-error';
import UnauthorizedError from '../errors/unauthorized-error';
import LoginRouter from './login-router';

const authSpy = jest.fn(
  async (email: string, password: string): Promise<string | null> =>
    'any_token',
);

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

const makeBaseSut = () => {
  const authUseCase = new AuthUseCase();
  const sut = new LoginRouter(authUseCase);

  return {
    authUseCase,
    sut,
  };
};

const makeSut = () => makeBaseSut();

const makeInvalidSut = () => {
  authSpy.mockResolvedValueOnce(null);
  return makeBaseSut();
};

const makeSutWithError = () => {
  authSpy.mockImplementationOnce(() => {
    throw new Error();
  });
  return makeBaseSut();
};

describe('Login Router', () => {
  test('should return 400 if no email is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        password: 'valid_password',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('email'));
  });

  test('should return 400 if no password is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'valid@email.com',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });

  test('should execute AuthUseCase with correct params', () => {
    const { sut } = makeSut();
    const mockedAuthUseCase = mocked(AuthUseCase, true);
    const httpRequest = {
      body: {
        email: 'valid@email.com',
        password: 'valid_password',
      },
    };
    sut.route(httpRequest);
    expect(mockedAuthUseCase).toHaveBeenCalledTimes(1);
    expect(authSpy).toHaveBeenCalledTimes(1);
    expect(authSpy).toHaveBeenCalledWith(
      httpRequest.body.email,
      httpRequest.body.password,
    );
  });

  test('should return 401 when invalid credentials are provided', async () => {
    const { sut } = makeInvalidSut();
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'invalid_password',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(401);
    expect(httpResponse.body).toEqual(new UnauthorizedError());
  });

  test('should return 500 wheb AuthUseCase throws an error', async () => {
    const { sut } = makeSutWithError();
    const httpRequest = {
      body: {
        email: 'valid@email.com',
        password: 'valid_password',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test('should return 200 when valid credentials are provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'valid@email.com',
        password: 'valid_password',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual({ accessToken: 'any_token' });
  });
});
