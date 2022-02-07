export class HTTPError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export class NotFoundError extends HTTPError {
  constructor(message?: string) {
    super(404, message || "Not Found");
  }
}
export class RequestError extends HTTPError {
  constructor(message?: string) {
    super(400, message || "Request Error");
  }
}
export class WrongMethodError extends HTTPError {
  constructor(message?: string) {
    super(405, message || "Invalid Method");
  }
}
