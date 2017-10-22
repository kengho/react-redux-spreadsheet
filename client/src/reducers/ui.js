import { fromJS } from 'immutable';

const defaultState = fromJS({
  dialog: {},
  current: {
    visibility: false,
    kind: null,
    place: null,
    cellId: null,
  },
});

export default function ui(state = defaultState, action) {
  switch (action.type) {
    // TODO: optimize.
    case 'UI/SET_DIALOG':
      return state.set(
        'dialog',
        fromJS(action.dialog)
      );

    case 'UI/CLOSE_DIALOG':
      return state.setIn(
        ['dialog', 'open'],
        false
      );

    case 'UI/DISPATCH_DIALOG_ACTION':
      // See middleware.
      return state;

    case 'UI/OPEN':
      return state
        .setIn(['current', 'visibility'], true)
        .setIn(['current', 'kind'], action.kind)
        .setIn(['current', 'place'], action.place)
        .setIn(['current', 'cellId'], action.cellId);

    case 'UI/CLOSE':
      return state.setIn(['current', 'visibility'], false);

    default:
      return state;
  }
}
