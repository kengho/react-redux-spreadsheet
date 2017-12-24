import { fromJS } from 'immutable';

import * as ActionTypes from '../actionTypes';

const defaultState = fromJS({
  current: {
    visibility: false,
    kind: null,
    place: null,
    cellId: null,
    variant: null, // Dialog
    disableYesButton: null, // Dialog
    errors: [], // Dialog
  },
  tableMenu: {
    disableNewSpreadsheetButton: null,
    newSpreadsheetPath: null,
  },
});

export default function ui(state = defaultState, action) {
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
