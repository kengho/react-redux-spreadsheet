import * as ActionTypes from '../../actionTypes';
import { makeServerRequest } from '../../actions/server';
import { SYNC } from '../../constants';

export default store => next => action => {
  // Prevent sending update request after initial render.
  if (action.type === ActionTypes.MERGE_SERVER_STATE && !action.changesData) {
    return next(action);
  }

  const previousTableLayout = store.getState().get('table').present.getIn(['major', 'layout']);
  const previousSettings = store.getState().get('settings');
  const nextAction = next(action); // all other middlewares happens there
  const nextTableLayout = store.getState().get('table').present.getIn(['major', 'layout']);
  const nextSettings = store.getState().get('settings');

  if (nextTableLayout === previousTableLayout && nextSettings === previousSettings) {
    return nextAction;
  }

  if (nextTableLayout === previousTableLayout && nextSettings === previousSettings) {
    return nextAction;
  }

  const sync = store.getState().getIn(['server', 'sync']);
  if (sync) {
    store.dispatch({
      ...makeServerRequest(SYNC),
      meta: { throttle: true },
    });
  }

  return nextAction;
};
