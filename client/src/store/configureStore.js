// VERY IMPORTANT NOTE:
// batchDispatchMiddleware causes significantly degraded performance because
//   it just do "store.dispatch(action)". Because of that we handle our special
//   cases of batched middleware-handled actions manually. By now it's only
//   SET_PROP in pushCellHistoryOnValueChanges. If we dispatch this action alone,
//   we just store.dispatch action that pushes history. If if comes with batched
//   actions, we can't dispatch it because there may not be table layout yet.
//   So in that case we push appropriate action into payload. (I know It may
//   (just may) be bad practice to modify action while dispatching it).
//   If you run into another cases when you should use shenanigans like that
//   please make a time to think more about this situation. (By the way, if we
//   don't batch SET_PROP while pressing Enter in cellKeyDownHandler render
//   time doubles (T_T)).

import { applyMiddleware, compose, createStore } from 'redux';
import { createBrowserHistory } from 'history';
import { routerMiddleware, connectRouter } from 'connected-react-router';
import { enableBatching, /* batchDispatchMiddleware */ } from 'redux-batched-actions';
import throttle from 'redux-throttle';

import batchActions from './middleware/batchActions';
import handleDataChanges from './middleware/handleDataChanges';
import handleServerRequests from './middleware/handleServerRequests';
import logger from './middleware/logger';
import pushCellHistoryOnValueChanges from './middleware/pushCellHistoryOnValueChanges';
import rootReducer from '../reducers';
import saveEditingCellValue from './middleware/saveEditingCellValue';
import workOnUserSpecifiedArea from './middleware/workOnUserSpecifiedArea';

const composeEnhancer = compose;

const configureMiddleware = (history) => {
  const defaultWait = 1000
  const defaultThrottleOption = { // https://lodash.com/docs#throttle
    leading: false,
    trailing: true,
  };

  const throttleMiddleware = throttle(defaultWait, defaultThrottleOption);
  const middleware = [
    routerMiddleware(history),
    throttleMiddleware,
    batchActions,
    // batchDispatchMiddleware,
    saveEditingCellValue,
    workOnUserSpecifiedArea,
    pushCellHistoryOnValueChanges,
    ...(process.env.NODE_ENV !== 'test' ? [
      handleServerRequests,
    ] : []),
    ...(process.env.NODE_ENV === 'development' ? [
      logger,
    ] : []),

    // NOTE: make sure this is the last middleware because it "wraps"
    //   all other and it could be hard to read code otherwise.
    ...(process.env.NODE_ENV !== 'test' ? [
      handleDataChanges,
    ] : []),
  ];

  return middleware;
}

const createStoreWithMiddleware = history => composeEnhancer(
  applyMiddleware(...configureMiddleware(history))(createStore),
);

export default (initialState, history = createBrowserHistory()) => {
  return createStoreWithMiddleware(history)(
    connectRouter(history)(enableBatching(rootReducer(history))),
    initialState
  );
};
