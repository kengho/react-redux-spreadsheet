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
      return setVisibility(state, action.uiKind, action.cellId, true);

    case 'UI/CLOSE':
      return setVisibility(state, action.uiKind, action.cellId, false);

    case 'UI/CLOSE_ALL':
      let nextState = state;
      action.uiKinds.forEach((uiKind) => {
        nextState = nextState.setIn(['visibility', uiKind], fromJS({}));
      })

      return nextState;

    default:
      return state;
  }
}
