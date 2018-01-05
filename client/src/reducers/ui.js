import { fromJS } from 'immutable';

import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

export default function ui(state = initialState().get('ui'), action) {
  switch (action.type) {
    case ActionTypes.OPEN_UI:
      return state
        .setIn(['current', 'visibility'], true)
        .setIn(['current', 'kind'], action.kind)
        .setIn(['current', 'place'], action.params.place)
        .setIn(['current', 'cellId'], action.params.cellId)
        .setIn(['current', 'variant'], action.params.variant)
        .setIn(['current', 'disableYesButton'], action.params.disableYesButton)
        .setIn(['current', 'errors'], fromJS(action.params.errors));

    case ActionTypes.CLOSE_UI:
      return state.setIn(['current', 'visibility'], false);

    case ActionTypes.DISABLE_NEW_SPREADSHEET_BUTTON:
      return state.set(
        'newSpreadsheetButtonIsDisabled',
        action.disable
      );

    case ActionTypes.SET_NEW_SPREADSHEET_PATH:
      return state.set(
        'newSpreadsheetPath',
        action.newSpreadsheetPath
      );

    default:
      return state;
  }
}
