export interface HashedPassword {
  passwordHash: string,
  salt: string,
  options: {
    algorithm: string,
    params: object,
  }
}
