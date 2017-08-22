import { fromJS } from 'immutable';

export default function requests(state = fromJS({ queue: [], counter: 0 }), action) {
  switch (action.type) {
    case 'PUSH_REQUEST': {
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

    case 'POP_REQUEST_ID': {
      const deleteIndex = state.get(
        'queue'
      ).findIndex(
        requestValue => requestValue.get('id') === action.id
      )

      if (deleteIndex !== -1) {
        return state.update(
          'queue',
          requestValue => requestValue.delete(deleteIndex)
        );
      }
    }

    case 'MARK_REQUEST_AS_FAILED': {
      const setIndex = state.get(
        'queue'
      ).findIndex(
        requestValue => requestValue.get('id') === action.id
      )

      if (setIndex !== -1) {
        return state.update(
          'queue',
          queueValue => queueValue.setIn(
            [setIndex, 'failed'],
            true
          )
        );
      }
    }

    default:
      return state;
  }
}
