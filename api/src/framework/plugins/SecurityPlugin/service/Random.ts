import * as crypto from 'crypto';

class Random {
  /*
   * Creates and returns a random hex string with the given length
   */
  randomString(len: number): string {
    const byteSize: number = Math.ceil(len / 2);
    const randomBytes: Buffer = crypto.randomBytes(byteSize);
    const str: string = randomBytes.toString('hex');
    return len === str.length ? str : str.substring(0, len - 1);
  }
}

export { Random };
