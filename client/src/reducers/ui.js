import { fromJS } from 'immutable';

const defaultState = fromJS({ menu: {} });

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

export default function meta(state = defaultState, action) {
  switch (action.type) {
    case 'OPEN_MENU':
      return setMenuVisibility(state, action.cellId, true);

    case 'CLOSE_MENU':
      return setMenuVisibility(state, action.cellId, false);

    case 'CLOSE_ALL_MENUS':
      return state.set('menu', defaultState);

    default:
      return state;
  }
}
