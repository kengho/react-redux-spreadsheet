import { fromJS } from 'immutable';

const defaultState = fromJS({
  messages: [],
  buttonIsDisabled: false,
})

export default function meta(state = defaultState, action) {
  switch (action.type) {
    case 'LANDING/SET_MESSAGES':
      return state.set(
        'messages',
        fromJS(action.messages)
      );

    case 'LANDING/DISABLE_LANDING_BUTTON':
      return state.set(
        'buttonIsDisabled',
        fromJS(action.disable)
      );

    default:
      return state;
  }
}
