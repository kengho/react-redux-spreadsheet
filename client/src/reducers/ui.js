import { fromJS } from 'immutable';

const defaultState = fromJS({
  dialog: {},
  menu: null,
  history: null,
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
      return state.set(action.uiKind, action.id);

    case 'UI/CLOSE':
      return state.set(action.uiKind, null);

    case 'UI/CLOSE_ALL':
      let nextState = state;
      action.uiKinds.forEach((uiKind) => {
        nextState = nextState.set(uiKind, null);
      })

      return nextState;

    default:
      return state;
  }
}
