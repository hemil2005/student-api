export default class TokenError extends Error {
  constructor(message) {
    super(message);
    this.name = "TokenError";
    this.status = 401;
  }
}
