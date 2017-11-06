import uuid from 'uuid/v4';

export function requestsPush(method, action, params, id = uuid()) {
  return {
    type: 'REQUESTS/PUSH',
    method,
    action,
    params,
    id,
  };
}

export function requestsPop(id) {
  return {
    type: 'REQUESTS/POP',
    id,
  };
}

export function requestsMarkAsFailed(id) {
  return {
    type: 'REQUESTS/MARK_AS_FAILED',
    id,
  };
}
