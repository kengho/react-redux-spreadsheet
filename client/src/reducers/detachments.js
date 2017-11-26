import { fromJS } from 'immutable';

import * as ActionTypes from '../actionTypes';

const defaultState = fromJS({
  currentCellValue: null,
});

export default function detachments(state = defaultState, action) {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_CELL_VALUE:
      return state.set(
        'currentCellValue',
        action.currentCellValue
      );

    case ActionTypes.MOVE_POINTER:
    case ActionTypes.SET_POINTER:
      return state.set(
        'currentCellValue',
        null
      );

    default:
      return state;
  }
}
