import { fromJS } from 'immutable';

const findRequestById = (state, id) => {
  return state.get(
    'queue'
  ).findIndex(
    requestValue => requestValue.get('id') === id
  )
};

export default function requests(state = fromJS({ queue: [], counter: 0 }), action) {
  switch (action.type) {
    case 'REQUESTS/PUSH': {
      const counter = state.get('counter');

      const request = {};
      request.method = action.method;
      request.action = action.action;
      request.params = action.params;
      request.id = action.id;

      return state.update(
        'queue',
        value => value.push(fromJS(request))
      ).set(
        'counter',
        counter + 1
      );
    }

    case 'REQUESTS/POP_ID': {
      const deleteIndex = findRequestById(state, action.id);

      if (deleteIndex !== -1) {
        return state.update(
          'queue',
          requestValue => requestValue.delete(deleteIndex)
        );
      }

      break;
    }

    case 'REQUESTS/MARK_AS_FAILED': {
      const setIndex = findRequestById(state, action.id);

      if (setIndex !== -1) {
        return state.update(
          'queue',
          queueValue => queueValue.setIn(
            [setIndex, 'failed'],
            true
          )
        );
      }

      break;
    }

    default:
      return state;
  }
}
