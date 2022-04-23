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
});
