class ApiException extends Error {
  constructor(private _statusCode: number, message: string) {
    super(message);
  }

  get statusCode() {
    return this._statusCode;
  }
}

export default ApiException;
