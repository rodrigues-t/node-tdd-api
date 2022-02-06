import isEmail from 'validator/lib/isEmail';
import MissingParamError from '../../presentation/errors/missing-param-error';

export default class EmailValidator {
  isValid(email: string, fieldName = 'email'): boolean {
    if (!email) {
      throw new MissingParamError(fieldName);
    }

    return isEmail(email);
  }
}
