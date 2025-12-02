import { Enum } from './Enum';

export class TokenType extends Enum {
  static AUTH_TOKEN = new TokenType('AUTH_TOKEN');
  static RESET_PASSWORD_TOKEN = new TokenType('RESET_PASSWORD_TOKEN');
  static get: (enumOrKey: TokenType | string) => TokenType = Enum.get.bind(TokenType);
  static dbTransformer = {
    to: (enumValue: Enum) => enumValue.key,
    from: (strValue: string) => TokenType.get(strValue),
  };
}
