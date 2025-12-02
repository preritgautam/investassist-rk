// TODO: Use SignOptions interface from jsonwebtoken lib
export type JwtConfig = {
  secret: string,
  issuer: string,
  expiresIn: string | number
}
