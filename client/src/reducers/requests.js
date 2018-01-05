import { fromJS } from 'immutable';

import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

const findRequestById = (state, id) => {
  return state.get(
    'queue'
  ).findIndex(
    requestValue => requestValue.get('id') === id
  )
};

export default function requests(state = initialState().get('requests'), action) {
  switch (action.type) {
    case ActionTypes.PUSH_REQUEST: {
      const counter = state.get('counter');

      const request = {};
      request.method = action.method;
      request.action = action.action;
      request.params = action.params;
      request.id = action.id;

      return state.update(
        'queue',
        value => value.push(fromJS(request))
      ).set(
        'counter',
        counter + 1
      );
    }

    case ActionTypes.POP_REQUEST: {
      const deleteIndex = findRequestById(state, action.id);

      if (deleteIndex !== -1) {
        return state.update(
          'queue',
          requestValue => requestValue.delete(deleteIndex)
        );
      }

      break;
    }

    case ActionTypes.MARK_REQUEST_AS_FAILED: {
      const setIndex = findRequestById(state, action.id);

      if (setIndex !== -1) {
        return state.update(
          'queue',
          queueValue => queueValue.setIn(
            [setIndex, 'failed'],
            true
          )
        );
      }

      break;
    }

    default:
      return state;
  }
}
