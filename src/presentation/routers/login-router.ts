import AuthUseCase from '../../domain/useCases/auth-usecase';
import EmailValidator from '../../utils/helpers/email-validator';
import { InvalidParamError, MissingParamError } from '../../utils/errors';
import HttpRequest from '../helpers/http-request';
import HttpResponse, { badRequest, serverError, ok, unauthorizedError } from '../helpers/http-response';

export default class LoginRouter {
  authUseCase: AuthUseCase;

  emailValidator: EmailValidator;

  constructor(authUseCase: AuthUseCase, emailValidator: EmailValidator) {
    this.authUseCase = authUseCase;
    this.emailValidator = emailValidator;
  }

  async route(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email, password } = httpRequest.body;
      if (!email) {
        return badRequest(new MissingParamError('email'));
      }

      if (!this.emailValidator.isValid(email)) {
        return badRequest(new InvalidParamError('email'));
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
