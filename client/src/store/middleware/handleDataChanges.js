import * as ActionTypes from '../../actionTypes';
import { makeServerRequest } from '../../actions/server';
import { SYNC } from '../../constants';

export default store => next => action => {
  // Prevent sending update request after initial render.
  if (action.type === ActionTypes.MERGE_SERVER_STATE) {
    return next(action);
  }

  // Don't process data unless action changes data.
  let changesData;
  if (action.type === ActionTypes.VENDOR_BATCH_ACTIONS) {
    changesData = action.payload.some((batchedAction) => batchedAction.changesData);
  } else {
    changesData = action.changesData;
  }
  if (!changesData) {
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

  const sync = store.getState().getIn(['server', 'sync']);

  // test_957
  if (sync) {
    store.dispatch({
      ...makeServerRequest(SYNC),
      meta: { throttle: true },
    });
  }

  return nextAction;
};
