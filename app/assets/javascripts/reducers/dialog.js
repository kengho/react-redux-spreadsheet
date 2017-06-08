import {
  fromJS,
} from 'immutable';

export default function meta(state = fromJS({ variant: undefined }), action) {
  switch (action.type) {
    case 'SET_DIALOG_VARIANT':
      return state.set(
        'variant',
        action.variant
      );
    default:
      return state;
  }
}
