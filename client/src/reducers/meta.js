import {
  fromJS,
} from 'immutable';

export default function meta(state = fromJS({ shortId: undefined }), action) {
  switch (action.type) {
    case 'SET_SHORT_ID':
      return state.set(
        'shortId',
        action.shortId
      );

    default:
      return state;
  }
}