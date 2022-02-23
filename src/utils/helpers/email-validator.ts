import isEmail from 'validator/lib/isEmail';
import MissingParamError from '../errors/missing-param-error';

export default class EmailValidator {
  isValid(email: string, fieldName = 'email'): boolean {
    if (!email) {
      throw new MissingParamError(fieldName);
    }

    return isEmail(email);
  }
}
