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

    default:
      return state;
  }
}
