import { fromJS } from 'immutable';

const defaultState = fromJS({
  dialog: {},
  visibility: {
    menu: {},
    history: {},
  },
});

const setVisibility = (state, branchName, id, visibility) => {
  const path = ['visibility', branchName, id];
  if (visibility) {
    return state.setIn(path, true);
  } else {
    return state.deleteIn(path);
  }
}

export default function ui(state = defaultState, action) {
  switch (action.type) {
    case 'OPEN_MENU':
      return setVisibility(state, 'menu', action.menuId, true);

    case 'CLOSE_MENU':
      return setVisibility(state, 'menu', action.menuId, false);

    case 'CLOSE_ALL_MENUS':
      return state.setIn(['visibility', 'menu'], fromJS({}));

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

    case 'OPEN_CELL_HISTORY':
      return setVisibility(state, 'history', action.cellId, true);

    case 'CLOSE_CELL_HISTORY':
      return setVisibility(state, 'history', action.cellId, false);

    case 'CLOSE_ALL_CELL_HISTORIES':
      return state.setIn(['visibility', 'history'], fromJS({}));

    default:
      return state;
  }
}
