import { InvalidParamError, MissingParamError } from '../../utils/errors';
import LoginResponse from './http-response-types/login-response';
import ServerError from '../errors/server-error';
import UnauthorizedError from '../errors/unauthorized-error';

export default interface HttpResponse {
  statusCode: number;
  body: Error | null | LoginResponse;
}

export type BadRequestErrors = MissingParamError | InvalidParamError;

const ok = (data: LoginResponse): HttpResponse => ({
  statusCode: 200,
  body: data,
});

const badRequest = (error: BadRequestErrors): HttpResponse => ({
  statusCode: 400,
  body: error,
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
