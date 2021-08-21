import { HttpRequest } from "../helpers/http-request";
import { HttpResponse } from "../helpers/http-response";

export class LoginRouter {
    route(httpRequest: HttpRequest) {
      try {
        const { email, password } = httpRequest.body
        if(!email) {
          return HttpResponse.badRequest('email');
        }
  
        if(!password) {
          return HttpResponse.badRequest('password')
        }
      } catch(error) {
        HttpResponse.serverError();
      }
  
      return HttpResponse.ok();
    }    
  }
