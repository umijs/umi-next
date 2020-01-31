import { join } from 'path';
import { getCredentials } from './utils';

jest.mock('@umijs/error-code-map', () => ({}));

jest.mock('fs', () => ({
  readFileSync(filename) {
    return new Buffer(filename);
  },
}));

describe('ServerUtils', () => {
  describe('getCredentials', () => {
    let spyError;
    beforeAll(() => {
      spyError = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {});
    });

    afterAll(() => {
      spyError.mockRestore();
    });

    it('getCredentials error', () => {
      expect(() => getCredentials({})).toThrowError(
        /Both options\.https\.key and options\.https\.cert are required\./,
      );
    });

    it('getCredentials normal', () => {
      expect(
        getCredentials({
          https: {
            key: '/tmp/key.pem',
            cert: '/tmp/cert.pem',
          },
        }),
      ).toEqual({
        key: new Buffer('/tmp/key.pem'),
        cert: new Buffer('/tmp/cert.pem'),
      });
    });

    it('getCredentials ca', () => {
      expect(
        getCredentials({
          https: {
            key: '/tmp/key.pem',
            cert: '/tmp/cert.pem',
            ca: '/tmp/ca.pem',
          },
        }),
      ).toEqual({
        key: new Buffer('/tmp/key.pem'),
        cert: new Buffer('/tmp/cert.pem'),
        ca: [new Buffer('/tmp/ca.pem')],
      });
    });

    it('getCredentials default', () => {
      expect(
        getCredentials({
          https: true,
        }),
      ).toEqual({
        key: new Buffer(join(__dirname, 'cert', 'key.pem')),
        cert: new Buffer(join(__dirname, 'cert', 'cert.pem')),
      });
    });
  });
});
