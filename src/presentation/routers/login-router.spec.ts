class LoginRouter {
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

interface HttpRequest {
  body: any,
}

class HttpResponse {
  static ok() {
    return {
      statusCode: 200,
      body: null
    }
  }
  static badRequest(paramName: string) {
    return {
      statusCode: 400,
      body: new MissingParamError(paramName),
    }
  }

  static serverError() {
    return {
      statusCode: 500,
      body: {
        name: 'server error'
      }
    }
  }
}

class MissingParamError extends Error {
  constructor(paramName: string) {
    super(`Missing param: ${paramName}`);
    this.name = MissingParamError.name;
  }
}

describe('Login Router', () => {
  test('should return 400 if no email is provided', () => {
    const sut = new LoginRouter();
    const httpRequest = {
      body: {
        password: '123456',
      }
    }
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('email'));
  });

  test('should return 400 if no password is provided', () => {
    const sut = new LoginRouter();
    const httpRequest = {
      body: {
        email: 'ozzy@sabbath.co.uk',
      }
    }
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });
});
