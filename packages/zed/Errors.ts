export class GenericError<ErrorCode, Details> extends Error {
  code: ErrorCode;
  httpStatus: number;
  details: Details;
  constructor({
    httpStatus = 500,
    code,
    message,
    details,
  }: {
    httpStatus?: number;
    code: ErrorCode;
    message: string;
    details: Details;
  }) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

export type AnyError = GenericError<any, any>;

export class ServerError<
  ErrorCode = "UnknownError",
  Details = undefined,
> extends GenericError<ErrorCode, Details> {
  constructor(code: ErrorCode, message = "Unknown Error.", details: Details) {
    super({ code, message, details, httpStatus: 500 });
  }
}

export class NotFoundError<
  ErrorCode = "NotFound",
  Details = undefined,
> extends GenericError<ErrorCode, Details> {
  constructor(code: ErrorCode, message = "Not Found.", details: Details) {
    super({ code, message, details, httpStatus: 404 });
  }
}

export class RequestError<
  ErrorCode = "InvalidRequest",
  Details = undefined,
> extends GenericError<ErrorCode, Details> {
  constructor(code: ErrorCode, message = "Invalid Request", details: Details) {
    super({ code, message, details, httpStatus: 400 });
  }
}

export class WrongMethodError<
  ErrorCode = "InvalidRequest",
  Details = undefined,
> extends GenericError<ErrorCode, Details> {
  constructor(code: ErrorCode, message = "Wrong Method", details: Details) {
    super({ code, message, details, httpStatus: 405 });
  }
}

export class UnauthorizedError<
  ErrorCode = "Unauthorized",
  Details = undefined,
> extends GenericError<ErrorCode, Details> {
  constructor(code: ErrorCode, message = "Unauthorized", details: Details) {
    super({ code, message, details, httpStatus: 401 });
  }
}

export class ForbiddenError<
  ErrorCode = "Forbidden",
  Details = undefined,
> extends GenericError<ErrorCode, Details> {
  constructor(code: ErrorCode, message = "Forbidden", details: Details) {
    super({ code, message, details, httpStatus: 403 });
  }
}
