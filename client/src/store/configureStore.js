import { applyMiddleware, compose, createStore } from 'redux';
import { createBrowserHistory } from 'history';
import { routerMiddleware, connectRouter } from 'connected-react-router/immutable';

import detectRowUpdatesNeed from './middleware/detectRowUpdatesNeed';
import handleClipboardChanges from './middleware/handleClipboardChanges';
import handleDataChanges from './middleware/handleDataChanges';
import handleDispatchDialogAction from './middleware/handleDispatchDialogAction';
import handlePointerChanges from './middleware/handlePointerChanges';
import handleRequestsChanges from './middleware/handleRequestsChanges';
import handleUndoRedo from './middleware/handleUndoRedo';
import pushCellHistory from './middleware/pushCellHistory';
import rootReducer from '../reducers';

const composeEnhancer = compose;

export const history = createBrowserHistory();

// TODO: reduce amount of middleware.
// TODO: made middleware names explicitly obvious.
const middleware = [
  handlePointerChanges,
];
if (process.env.NODE_ENV !== 'test') {
  middleware.push(
    routerMiddleware(history),
    detectRowUpdatesNeed,
    handleClipboardChanges,
    handleDispatchDialogAction,
    handleRequestsChanges,
    handleUndoRedo,
    pushCellHistory,
    handleDataChanges // make sure this is the last middleware
  );
}

const createStoreWithMiddleware = composeEnhancer(
  applyMiddleware(...middleware)(createStore)
);

export function configureStore(initialState) {
  return createStoreWithMiddleware(
    connectRouter(history)(rootReducer),
    initialState
  );
}
