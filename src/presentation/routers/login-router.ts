import AuthUseCase from '../../domain/useCases/auth-usecase';
import MissingParamError from '../errors/missing-param-error';
import HttpRequest from '../helpers/http-request';
import HttpResponse, {
  badRequest,
  serverError,
  ok,
  unauthorizedError,
} from '../helpers/http-response';

export default class LoginRouter {
  authUseCase: AuthUseCase;

  constructor(authUseCase: AuthUseCase) {
    this.authUseCase = authUseCase;
  }

  async route(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email, password } = httpRequest.body;
      if (!email) {
        return badRequest(new MissingParamError('email'));
      }

      if (!password) {
        return badRequest(new MissingParamError('password'));
      }

      const accessToken = await this.authUseCase.auth(email, password);

      if (!accessToken) {
        return unauthorizedError();
      }

      return ok({ accessToken });
    } catch (error) {
      return serverError();
    }
  }
}
