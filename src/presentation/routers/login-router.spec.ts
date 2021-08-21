import { MissingParamError } from "../helpers/missing-param-error";
import { LoginRouter } from "./login-router";

const makeSut = () => new LoginRouter()

describe('Login Router', () => {
  test('should return 400 if no email is provided', () => {
    const sut = makeSut();
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
    const sut = makeSut();
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
