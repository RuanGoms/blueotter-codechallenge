export type ServiceResponse<T = null> =
  | { kind: 'OK'; data: T }
  | { kind: 'Created'; data: T }
  | { kind: 'NotFound' }
  | { kind: 'BadRequest'; message: string }
  | { kind: 'NoContent'; data: null }
  | { kind: 'Unauthorized' }
  | { kind: 'Forbidden' }
  | { kind: 'Error'; error: string };
