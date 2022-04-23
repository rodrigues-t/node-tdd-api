import Encrypter from './encrypter';

const makeSut = () => {
  return new Encrypter();
};

describe('Encrypter', () => {
  test('should return true if bcrypt return true', async () => {
    const sut = makeSut();
    const isValid = await sut.compare('any_password', 'hashed_password');
    expect(isValid).toBe(true);
  });
});
