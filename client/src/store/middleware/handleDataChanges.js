import * as ActionTypes from '../../actionTypes';
import { makeServerRequest } from '../../actions/server';
import { SYNC } from '../../constants';

export default store => next => action => {
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

  const previousTableLayout = store.getState().table.present.major.layout;
  const previousSettings = store.getState().settings;
  const nextAction = next(action); // all other middlewares happens there
  const nextTableLayout = store.getState().table.present.major.layout;
  const nextSettings = store.getState().settings;
  if ((nextTableLayout === previousTableLayout) && (nextSettings === previousSettings)) {
    return nextAction;
  }

  const sync = store.getState().server.sync;
  if (!sync) {
    return nextAction;
  }

  // test_957
  store.dispatch({
    ...makeServerRequest(SYNC),
    meta: { throttle: true },
  });

  return nextAction;
};
