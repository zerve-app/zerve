export class GenericError<ErrorCode, Params> extends Error {
  code: ErrorCode;
  httpStatus: number;
  params: Params;
  constructor({
    httpStatus = 500,
    code,
    message,
    params,
  }: {
    httpStatus?: number;
    code: ErrorCode;
    message: string;
    params: Params;
  }) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.params = params;
  }
}

export class NotFoundError<
  ErrorCode = "NotFound",
  Params = undefined
> extends GenericError<ErrorCode, Params> {
  constructor(code: ErrorCode, message = "Not Found.", params: Params) {
    super({ code, message, params, httpStatus: 404 });
  }
}

export class RequestError<
  ErrorCode = "InvalidRequest",
  Params = undefined
> extends GenericError<ErrorCode, Params> {
  constructor(code: ErrorCode, message = "Invalid Request", params: Params) {
    super({ code, message, params, httpStatus: 400 });
  }
}

export class WrongMethodError<
  ErrorCode = "InvalidRequest",
  Params = undefined
> extends GenericError<ErrorCode, Params> {
  constructor(code: ErrorCode, message = "Wrong Method", params: Params) {
    super({ code, message, params, httpStatus: 405 });
  }
}
