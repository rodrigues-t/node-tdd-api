import signSpy from '../../test/spies/token-sign-spy';
import { InvalidParamError } from '../errors';
import TokenGenerator from './token-generator';

jest.mock('jsonwebtoken', () => {
  return {
    ...jest.requireActual('jsonwebtoken'),
    sign: signSpy,
  };
});

const makeSut = (secret = 'secret') => new TokenGenerator(secret);

beforeEach(() => {
  signSpy.mockClear();
});

describe('Token Generator', () => {
  test('Should return null if JWT returns null', async () => {
    const sut = makeSut();
    signSpy.mockReturnValueOnce(null);
    const token = await sut.generate('any_id');
    expect(token).toBeNull();
  });

  test('Should return token if JWT returns token', async () => {
    const sut = makeSut();
    const token = await sut.generate('any_id');
    expect(token).toBe('any_token');
  });

  test('Should call JWT with correct values', async () => {
    const sut = makeSut();
    await sut.generate('any_id');
    expect(signSpy).toBeCalledTimes(1);
    expect(signSpy).toBeCalledWith('any_id', 'secret');
  });

  test('Should throw if invalid secret is providade', async () => {
    const sut = makeSut(null as unknown as string);
    const promise = sut.generate('any_id');
    expect(promise).rejects.toThrow(InvalidParamError);
  });

  test('Should throw if invalid id is providade', async () => {
    const sut = makeSut();
    const promise = sut.generate(null as unknown as string);
    expect(promise).rejects.toThrow(InvalidParamError);
  });
});
