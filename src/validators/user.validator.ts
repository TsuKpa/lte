import validator from 'validator';

export class UserValidator {
  static validate(body, listKeysToValidate: string[]) {
    const errors: string[] = [];

    if (
      listKeysToValidate.includes('email') &&
      !validator.isEmail(body.email)
    ) {
      errors.push('Invalid Email format');
    }

    if (
      listKeysToValidate.includes('password') &&
      validator.isEmpty(body.password)
    ) {
      errors.push('Password cannot be empty');
    }

    return errors;
  }
}
