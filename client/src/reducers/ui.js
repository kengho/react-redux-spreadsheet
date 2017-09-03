import { fromJS } from 'immutable';

const defaultState = fromJS({ menu: {}, dialog: {} });

const setMenuVisibility = (state, cellId, visibility) => {
  if (visibility) {
    return state.setIn(
      ['menu', cellId],
      true
    );
  } else {
    return state.deleteIn(['menu', cellId]);
  }
}

export default function ui(state = defaultState, action) {
  switch (action.type) {
    case 'OPEN_MENU':
      return setMenuVisibility(state, action.cellId, true);

    case 'CLOSE_MENU':
      return setMenuVisibility(state, action.cellId, false);

    case 'CLOSE_ALL_MENUS':
      return state.set('menu', defaultState);

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

    default:
      return state;
  }
}