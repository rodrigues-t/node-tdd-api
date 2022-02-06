import { mocked } from 'jest-mock';
import AuthUseCase from '../../domain/useCases/auth-usecase';
import InvalidParamError from '../errors/invalid-param-error';
import MissingParamError from '../errors/missing-param-error';
import ServerError from '../errors/server-error';
import UnauthorizedError from '../errors/unauthorized-error';
import LoginRouter from './login-router';
import EmailValidator from '../../utils/helpers/email-validator';

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

const isValidEmailSpy = jest.fn((email: string) => true);

jest.mock('../../utils/helpers/email-validator', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isValid: isValidEmailSpy,
    };
  });
});

beforeEach(() => {
  isValidEmailSpy.mockClear();
  mocked(AuthUseCase).mockClear();
  mocked(EmailValidator).mockClear();
});

const makeSut = () => {
  const authUseCase = new AuthUseCase();
  const emailValidator = new EmailValidator();
  const sut = new LoginRouter(authUseCase, emailValidator);

  return {
    authUseCase,
    emailValidator,
    sut,
  };
};

const makeSutWithInvalidEmail = () => {
  isValidEmailSpy.mockReturnValueOnce(false);
  return makeSut();
};

const makeSutWithAuthDenied = () => {
  authSpy.mockResolvedValueOnce(null);
  return makeSut();
};

const makeSutWithError = () => {
  authSpy.mockImplementationOnce(() => {
    throw new Error();
  });
  return makeSut();
};

describe('Login Router', () => {
  test('should return 400 if no email is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        password: 'any_password',
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
        email: 'any@email.com',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });

  test('should return 400 if invalid email is provided', async () => {
    const { sut } = makeSutWithInvalidEmail();
    const mockedEmailValidator = mocked(EmailValidator, true);
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'any_password',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('email'));
    expect(mockedEmailValidator).toHaveBeenCalledTimes(1);
    expect(isValidEmailSpy).toHaveBeenCalledTimes(1);
    expect(isValidEmailSpy).toHaveBeenCalledWith(httpRequest.body.email);
  });

  test('should execute AuthUseCase with correct params', () => {
    const { sut } = makeSut();
    const mockedAuthUseCase = mocked(AuthUseCase, true);
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any_password',
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
    const { sut } = makeSutWithAuthDenied();
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

  test('should return 500 when AuthUseCase throws an error', async () => {
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

  test('should return 500 if no EmailValidator is provided', async () => {
    const sut = new LoginRouter(new AuthUseCase(), null!);
    const mockedEmailValidator = mocked(EmailValidator, true);
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any_password',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
    expect(mockedEmailValidator).toHaveBeenCalledTimes(0);
    expect(isValidEmailSpy).toHaveBeenCalledTimes(0);
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
