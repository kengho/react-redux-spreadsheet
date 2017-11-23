import { fromJS } from 'immutable';

import * as ActionTypes from '../actionTypes';

const defaultState = fromJS({
  currentCellValue: null,
});

export default function meta(state = defaultState, action) {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_CELL_VALUE:
      return state.set(
        'currentCellValue',
        action.currentCellValue
      );

    default:
      return state;
  }
}
