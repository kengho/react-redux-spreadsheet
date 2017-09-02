import { fromJS } from 'immutable';

const defaultState = fromJS({
  messages: [],
  buttonIsDisabled: false,
})

export default function meta(state = defaultState, action) {
  switch (action.type) {
    case 'SET_MESSAGES':
      return state.set(
        'messages',
        fromJS(action.messages)
      );

    case 'DISABLE_LANDING_BUTTON':
      return state.set(
        'buttonIsDisabled',
        fromJS(action.disable)
      );

    default:
      return state;
  }
}
