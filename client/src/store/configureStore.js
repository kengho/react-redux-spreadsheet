import { applyMiddleware, compose, createStore } from 'redux';
import { createBrowserHistory } from 'history';
import { routerMiddleware, connectRouter } from 'connected-react-router/immutable';

import copyToRealClipboardOnSetClipboard from './middleware/copyToRealClipboardOnSetClipboard';
import expandTableOnPointerMove from './middleware/expandTableOnPointerMove';
import handleRequestsOnQueueChange from './middleware/handleRequestsOnQueueChange';
import pushCellHistoryOnValueChanges from './middleware/pushCellHistoryOnValueChanges';
import pushRequestOnDataChanges from './middleware/pushRequestOnDataChanges';
import setRowUpdateTriggerOnStateChanges from './middleware/setRowUpdateTriggerOnStateChanges';
import saveEditingCellValueIfNeeded from './middleware/saveEditingCellValueIfNeeded';
import rootReducer from '../reducers';

const composeEnhancer = compose;

const configureMiddleware = (history) => {
  const middleware = [
    routerMiddleware(history),
    expandTableOnPointerMove,
    setRowUpdateTriggerOnStateChanges,
    saveEditingCellValueIfNeeded,
    pushRequestOnDataChanges,
  ];
  if (process.env.NODE_ENV !== 'test') {
    middleware.push(
      copyToRealClipboardOnSetClipboard,

      // TODO: use in test env too.
      pushCellHistoryOnValueChanges,
      handleRequestsOnQueueChange,
    );
  }
  // Make sure this is the last middleware.
  middleware.push(pushRequestOnDataChanges)

  return middleware;
}

const createStoreWithMiddleware = (history) => composeEnhancer(
  applyMiddleware(...configureMiddleware(history))(createStore)
);

export function configureStore(initialState, history = createBrowserHistory()) {
  return createStoreWithMiddleware(history)(
    connectRouter(history)(rootReducer),
    initialState
  );
}
