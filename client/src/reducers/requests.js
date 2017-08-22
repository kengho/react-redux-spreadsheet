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
        queueValue => queueValue.get('id') === action.id
      )

      if (deleteIndex !== -1) {
        return state.update(
          'queue',
          queueValue => queueValue.delete(deleteIndex)
        );
      }
    }

    case 'MARK_REQUEST_AS_FAILED': {
      return state.update(
        'queue',
        queueValue => queueValue.setIn(
          [
            queueValue.findIndex(
              requestValue => requestValue.get('id') === action.id
            ),
            'failed',
          ],
          true
        )
      );
    }

    default:
      return state;
  }
}
