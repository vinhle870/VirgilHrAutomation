export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

export const HTTP_METHODS: HTTPMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD',
];

export function isHTTPMethod(value: string): value is HTTPMethod {
  return HTTP_METHODS.includes(value as HTTPMethod);
}

export default HTTPMethod;
