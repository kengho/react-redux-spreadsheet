import { fromJS } from 'immutable';

export default function meta(state = fromJS({}), action) {
  switch (action.type) {
    case 'META/SET_SHORT_ID':
      return state.set(
        'shortId',
        action.shortId
      );

    default:
      return state;
  }
}
