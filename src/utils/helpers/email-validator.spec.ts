// const isEmailSpy = jest.fn((email: string) => true);
import { MissingParamError } from '../../presentation/errors';
import isEmailSpy from '../../test/spies/email-spy';
import EmailValidator from './email-validator';

jest.mock('validator/lib/isEmail', () => {
  return jest.fn().mockImplementation(isEmailSpy);
});

const makeSut = () => new EmailValidator();

beforeEach(() => {
  isEmailSpy.mockClear();
});

describe('Email Validator', () => {
  test('should return true if validator returns true', () => {
    const sut = makeSut();
    const isValid = sut.isValid('valid_email@email.com');
    expect(isValid).toBeTruthy();
  });

  test('should return false if validator returns false', () => {
    isEmailSpy.mockReturnValueOnce(false);
    const sut = makeSut();
    const isValid = sut.isValid('invalid_email@email.com');
    expect(isValid).toBeFalsy();
  });

  test('should call validator with correct email', () => {
    const sut = makeSut();
    sut.isValid('any@email.com');
    expect(isEmailSpy).toHaveBeenCalledTimes(1);
    expect(isEmailSpy).toHaveBeenCalledWith('any@email.com');
  });

  test('should throw MissingParamError if null email is provides', () => {
    const sut = makeSut();
    const email: string | null = null;
    expect(() => sut.isValid(email!)).toThrow(MissingParamError);
  });
});
