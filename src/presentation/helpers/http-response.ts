import MissingParamError from './missing-param-error';

export default interface HttpResponse {
  statusCode: number;
  body: Error | null;
}

const ok = (): HttpResponse => ({
  statusCode: 200,
  body: null,
});

const badRequest = (paramName: string): HttpResponse => ({
  statusCode: 400,
  body: new MissingParamError(paramName),
});

const serverError = (): HttpResponse => ({
  statusCode: 500,
  body: new Error('server error'),
});

export { ok, badRequest, serverError };
