import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

export default function meta(state = initialState().get('meta'), action) {
  switch (action.type) {
    case ActionTypes.SET_SHORT_ID:
      return state.set(
        'shortId',
        action.shortId
      );

    default:
      return state;
  }
}
