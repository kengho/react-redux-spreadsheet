import uuid from 'uuid/v4';

export function pushRequest(method, action, params, id = uuid()) {
  return {
    type: 'PUSH_REQUEST',
    method,
    action,
    params,
    id,
  };
}

export function popRequestId(id) {
  return {
    type: 'POP_REQUEST_ID',
    id,
  };
}

export function markRequestAsFailed(id) {
  return {
    type: 'MARK_REQUEST_AS_FAILED',
    id,
  };
}

export function incrementCounter() {
  return {
    type: 'INCREMENT_COUNTER',
  };
}
