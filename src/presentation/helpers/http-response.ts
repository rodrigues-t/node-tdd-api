import UnauthorizedError from '../errors/unauthorized-error';
import MissingParamError from '../errors/missing-param-error';
import ServerError from '../errors/server-error';
import LoginResponse from './http-response-types/login-response';

export default interface HttpResponse {
  statusCode: number;
  body: Error | null | LoginResponse;
}

const ok = (data: LoginResponse): HttpResponse => ({
  statusCode: 200,
  body: data,
});

const badRequest = (paramName: string): HttpResponse => ({
  statusCode: 400,
  body: new MissingParamError(paramName),
});

const serverError = (): HttpResponse => ({
  statusCode: 500,
  body: new ServerError(),
});

const unauthorizedError = (): HttpResponse => ({
  statusCode: 401,
  body: new UnauthorizedError(),
});

export { ok, badRequest, serverError, unauthorizedError };
