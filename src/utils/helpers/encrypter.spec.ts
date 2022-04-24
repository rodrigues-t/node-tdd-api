import compareSpy from '../../test/spies/bcrypt-spies';
import Encrypter from './encrypter';

jest.mock('bcrypt', () => {
  return {
    ...jest.requireActual('bcrypt'),
    compare: compareSpy,
  };
});

const makeSut = () => {
  return new Encrypter();
};

beforeEach(() => {
  compareSpy.mockClear();
});

describe('Encrypter', () => {
  test('should return true if bcrypt return true', async () => {
    const sut = makeSut();
    const isValid = await sut.compare('any_value', 'hashed_value');
    expect(isValid).toBe(true);
  });

  test('should return false if bcrypt return false', async () => {
    const sut = makeSut();
    compareSpy.mockReturnValueOnce(false);
    const isValid = await sut.compare('any_value', 'hashed_value');
    expect(isValid).toBe(false);
  });

  test('bcrypt should be called with correct values', async () => {
    const sut = makeSut();
    await sut.compare('any_password', 'hashed_value');
    expect(compareSpy).toHaveBeenCalledTimes(1);
    expect(compareSpy).toBeCalledWith('any_password', 'hashed_value');
  });
});
