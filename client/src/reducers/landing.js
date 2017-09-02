import { fromJS } from 'immutable';

export default function meta(state = fromJS({ messages: [] }), action) {
  switch (action.type) {
    case 'SET_MESSAGES':
      return state.set(
        'messages',
        fromJS(action.messages)
      );

    default:
      return state;
  }
}
