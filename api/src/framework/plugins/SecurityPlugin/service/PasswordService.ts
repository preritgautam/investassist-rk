import { HashService } from './HashService';
import { Random } from './Random';
import { HashedPassword } from '../models/HashedPassword';

class PasswordService {
  constructor(
    private readonly hashService: HashService,
    private readonly random: Random,
  ) {
  }
  /*
   * Hash a password and return json object with has, salt and algorithm used
   */
  hashPassword(password: string): HashedPassword {
    const salt = this.random.randomString(32);
    const passwordWithSalt = salt + password;
    const hash = this.hashService.hash({
      text: passwordWithSalt,
      algorithm: 'sha256',
      params: {},
    });

    return {
      passwordHash: hash,
      salt,
      options: {
        algorithm: 'sha256',
        params: {},
      },
    };
  }

  /*
   * Verifies a given checkPassword against a previously hashed password given the previous hash parameters
   */
  verifyPassword(checkPassword: string, { passwordHash, salt, options }: HashedPassword): boolean {
    const { algorithm, params } = options;
    const checkPasswordWithSalt = salt + checkPassword;
    const checkPasswordHash = this.hashService.hash({
      text: checkPasswordWithSalt,
      algorithm,
      params,
    });

    return checkPasswordHash === passwordHash;
  }
}

export { PasswordService };
