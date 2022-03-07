import { mocked } from 'jest-mock';
import AuthUseCase from '../../domain/useCases/auth-usecase';
import { ServerError, UnauthorizedError } from '../errors';
import { InvalidParamError, MissingParamError } from '../../utils/errors';
import LoginRouter from './login-router';
import EmailValidator from '../../utils/helpers/email-validator';
import LoadUserByEmailRepository from '../../infra/repositories/load-user-by-email-repository';

enum SutType {
  Regular,
  AuthFail,
  AuthThrowError,
  EmailValidatorFail,
  EmailValidatorThrowError,
}

const authSpy = jest.fn(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (email: string, password: string): Promise<string | null> => 'any_token',
);

jest.mock('../../domain/useCases/auth-usecase', () => {
  return jest.fn().mockImplementation(() => {
    return {
      auth: authSpy,
    };
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const sutAuthFail = () => authSpy.mockResolvedValueOnce(null);

const sutAuthThrowError = () => {
  authSpy.mockImplementationOnce(() => {
    throw new Error();
  });
};

const sutEmailValidatorFail = () => isValidEmailSpy.mockReturnValueOnce(false);

const sutEmailValidatorThrowError = () => {
  isValidEmailSpy.mockImplementationOnce(() => {
    throw new Error();
  });
};

const makeSut = (sutType: SutType = SutType.Regular) => {
  const authUseCase = new AuthUseCase(new LoadUserByEmailRepository());
  const emailValidator = new EmailValidator();
  const sut = new LoginRouter(authUseCase, emailValidator);

  switch (sutType) {
    case SutType.AuthFail:
      sutAuthFail();
      break;
    case SutType.AuthThrowError:
      sutAuthThrowError();
      break;
    case SutType.EmailValidatorFail:
      sutEmailValidatorFail();
      break;
    case SutType.EmailValidatorThrowError:
      sutEmailValidatorThrowError();
      break;
    default:
      break;
  }

  return {
    authUseCase,
    emailValidator,
    sut,
  };
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
    const { sut } = makeSut(SutType.EmailValidatorFail);
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
    expect(authSpy).toHaveBeenCalledWith(httpRequest.body.email, httpRequest.body.password);
  });

  test('should return 401 when invalid credentials are provided', async () => {
    const { sut } = makeSut(SutType.AuthFail);
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
    const { sut } = makeSut(SutType.AuthThrowError);
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sut = new LoginRouter(new AuthUseCase(new LoadUserByEmailRepository()), null!);
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

  test('should return 500 when EmailValidator throws an error', async () => {
    const { sut } = makeSut(SutType.EmailValidatorThrowError);
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any_password',
      },
    };
    const httpResponse = await sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test('should execute EmailValidator with correct params', () => {
    const { sut } = makeSut();
    const mockedEmailValidator = mocked(EmailValidator, true);
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any_password',
      },
    };
    sut.route(httpRequest);
    expect(mockedEmailValidator).toHaveBeenCalledTimes(1);
    expect(isValidEmailSpy).toHaveBeenCalledTimes(1);
    expect(isValidEmailSpy).toHaveBeenCalledWith(httpRequest.body.email);
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
