import * as crypto from 'crypto';

class HashService {
  hash({ text, algorithm, params = {} }: { text: string, algorithm: string, params: object }): string {
    const cryptoHash: crypto.Hash = crypto.createHash(algorithm, params);
    cryptoHash.update(text);
    return cryptoHash.digest('hex');
  }
}

export { HashService };
