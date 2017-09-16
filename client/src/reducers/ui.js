import { fromJS } from 'immutable';

const defaultState = fromJS({ menu: {}, dialog: {} });

const setMenuVisibility = (state, menuId, visibility) => {
  if (visibility) {
    return state.setIn(
      ['menu', menuId],
      true
    );
  } else {
    return state.deleteIn(['menu', menuId]);
  }
}

export default function ui(state = defaultState, action) {
  switch (action.type) {
    case 'OPEN_MENU':
      return setMenuVisibility(state, action.menuId, true);

    case 'CLOSE_MENU':
      return setMenuVisibility(state, action.menuId, false);

    case 'CLOSE_ALL_MENUS':
      return state.set('menu', fromJS({}));

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

    default:
      return state;
  }
}
