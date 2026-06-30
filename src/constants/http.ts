export enum HttpStatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum HttpMessages {
  OK = 'OK',
  CREATED = 'Created',
  NO_CONTENT = 'No Content',
  BAD_REQUEST = 'Bad Request',
  UNAUTHORIZED = 'Unauthorized',
  NOT_FOUND = 'Not Found',
  SUCCESS = 'Success',
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
}
export enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
}

export const allowedHttpMethods: HttpMethods[] = [HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT, HttpMethods.DELETE, HttpMethods.PATCH, HttpMethods.OPTIONS];