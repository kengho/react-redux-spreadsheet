import { fromJS } from 'immutable';

const defaultState = fromJS({});

export default function meta(state = defaultState, action) {
  switch (action.type) {
    case 'SET_DIALOG':
      return fromJS(action.dialog);

    case 'SET_DIALOG_VISIBILITY':
      return state.set(
        'visibility',
        action.visibility
      );

    case 'DISPACH_DIALOG_ACTION':
      // See middleware.
      return state;

    default:
      return state;
  }
}
