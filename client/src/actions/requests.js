import uuid from 'uuid/v4';

import * as ActionTypes from '../actionTypes';

export function requestsPush(method, action, params, id = uuid()) {
  return {
    type: ActionTypes.PUSH_REQUEST,
    method,
    action,
    params,
    id,
  };
}

export function requestsPop(id) {
  return {
    type: ActionTypes.POP_REQUEST,
    id,
  };
}

export function requestsMarkAsFailed(id) {
  return {
    type: ActionTypes.MARK_REQUEST_AS_FAILED,
    id,
  };
}
