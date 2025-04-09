import { compare, hash } from './crypto.helper';

describe('CryptoHelper', () => {
  const checkRegExp = /^[0-9a-f]{20}:[0-9a-f]{128}$/;
  const password = 'password';

  describe('hash', () => {
    it('should be return hashed string', async () => {
      const received = await hash(password);
      expect(received).toMatch(checkRegExp);
    });

    it('should be return hashed string the same length even password more longer', async () => {
      const received = await hash(password.repeat(10));
      expect(received).toMatch(checkRegExp);
    });
  });

  describe('compare', () => {
    it('should be return true when passwords same', async () => {
      const encrypted = await hash(password);

      const received = await compare(password, encrypted);
      expect(received).toEqual(true);
    });

    it('should be return false when passwords not same', async () => {
      const encrypted = await hash('notPassword');

      const received = await compare(password, encrypted);
      expect(received).toEqual(false);
    });
  });
});
