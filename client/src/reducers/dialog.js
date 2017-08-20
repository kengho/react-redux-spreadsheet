import {
  fromJS,
} from 'immutable';

export default function meta(state = fromJS(
  {
    action: undefined,
    variant: undefined,
    visibility: undefined,
  }
), action) {
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
