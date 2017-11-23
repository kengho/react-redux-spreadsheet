import { fromJS } from 'immutable';

import * as ActionTypes from '../actionTypes';

export default function meta(state = fromJS({}), action) {
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
