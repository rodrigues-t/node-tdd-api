import AuthUseCase from '../../domain/useCases/auth-usecase';
import HttpRequest from '../helpers/http-request';
import HttpResponse, {
  badRequest,
  serverError,
  ok,
} from '../helpers/http-response';

export default class LoginRouter {
  authUseCase: AuthUseCase;

  constructor(authUseCase: AuthUseCase) {
    this.authUseCase = authUseCase;
  }

  route(httpRequest: HttpRequest): HttpResponse {
    try {
      const { email, password } = httpRequest.body;
      if (!email) {
        return badRequest('email');
      }

      if (!password) {
        return badRequest('password');
      }

      this.authUseCase.auth(email, password);
      return ok();
    } catch (error) {
      return serverError();
    }
  }
}
