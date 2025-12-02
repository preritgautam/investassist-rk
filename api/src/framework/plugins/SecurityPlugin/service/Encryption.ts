import * as crypto from 'crypto';

export interface EncryptedData {
  iv: string,
  encrypted: string,
}

export class Encryption {
  encryptData(data: object, key: string, algorithm: string = 'aes-256-cbc'): string {
    return encodeURIComponent(
      Buffer.from(JSON.stringify(this.encryptDataObject(data, key, algorithm))).toString('base64'),
    );
  }

  encryptDataObject(data: object, key: string, algorithm: string = 'aes-256-cbc'): EncryptedData {
    return this.encryptStr(JSON.stringify(data), key, algorithm);
  }

  encryptStr(text: string, key: string, algorithm: string = 'aes-256-cbc'): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encrypted: encrypted.toString('hex') };
  }

  decryptStr(encrypted: EncryptedData, key: string, algorithm: string = 'aes-256-cbc'): string {
    const iv = Buffer.from(encrypted.iv, 'hex');
    const encryptedText = Buffer.from(encrypted.encrypted, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  decryptDataObject<T>(encrypted: EncryptedData, key: string, algorithm: string = 'aes-256-cbc'): T {
    return JSON.parse(this.decryptStr(encrypted, key, algorithm));
  }

  decryptData<T>(encrypted: string, key: string, algorithm: string = 'aes-256-cbc'): T {
    return this.decryptDataObject(
      JSON.parse(Buffer.from(decodeURIComponent(encrypted), 'base64').toString('utf-8')),
      key,
      algorithm,
    );
  }
}
