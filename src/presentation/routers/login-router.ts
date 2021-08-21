import HttpRequest from '../helpers/http-request';
import HttpResponse, {
  badRequest,
  serverError,
  ok,
} from '../helpers/http-response';

export default class LoginRouter {
  route(httpRequest: HttpRequest): HttpResponse {
    try {
      const { email, password } = httpRequest.body;
      if (!email) {
        return badRequest('email');
      }

      if (!password) {
        return badRequest('password');
      }
    } catch (error) {
      serverError();
    }

    return ok();
  }
}
