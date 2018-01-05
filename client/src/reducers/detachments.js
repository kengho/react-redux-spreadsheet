import { fromJS } from 'immutable';

import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

export default function detachments(state = initialState().get('detachments'), action) {
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
