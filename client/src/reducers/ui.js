import { fromJS } from 'immutable';

const defaultState = fromJS({
  dialog: {},
  visibility: {
    menu: {},
    history: {},
  },
});

const setVisibility = (state, uiKind, id, visibility) => {
  const path = ['visibility', uiKind, id];
  if (visibility) {
    return state.setIn(path, true);
  } else {
    return state.deleteIn(path);
  }
}

export default function ui(state = defaultState, action) {
  switch (action.type) {
    // TODO: optimize.
    case 'SET_DIALOG':
      return state.set(
        'dialog',
        fromJS(action.dialog)
      );

    case 'OPEN_DIALOG':
      return state.setIn(
        ['dialog', 'open'],
        true
      );

    case 'CLOSE_DIALOG':
      return state.setIn(
        ['dialog', 'open'],
        false
      );

    case 'DISPATCH_DIALOG_ACTION':
      // See middleware.
      return state;

    case 'OPEN':
      return setVisibility(state, action.uiKind, action.cellId, true);

    case 'CLOSE':
      return setVisibility(state, action.uiKind, action.cellId, false);

    case 'CLOSE_ALL':
      return state.setIn(['visibility', action.uiKind], fromJS({}));

    default:
      return state;
  }
}
