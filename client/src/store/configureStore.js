import { applyMiddleware, compose, createStore } from 'redux';
import { createBrowserHistory } from 'history';
import { routerMiddleware, connectRouter } from 'connected-react-router/immutable';

import clearPointerModifiersOnUndoRedo from './middleware/clearPointerModifiersOnUndoRedo';
import copyToRealClipboardOnSetClipboard from './middleware/copyToRealClipboardOnSetClipboard';
import expandTableOnPointerMove from './middleware/expandTableOnPointerMove';
import handleRequestsOnQueueChange from './middleware/handleRequestsOnQueueChange';
import pushCellHistoryOnValueChanges from './middleware/pushCellHistoryOnValueChanges';
import pushRequestOnDataChanges from './middleware/pushRequestOnDataChanges';
import setRowUpdateTriggerOnStateChanges from './middleware/setRowUpdateTriggerOnStateChanges';
import clearDetachmentsCurrentCellValueOnPointerMove from './middleware/clearDetachmentsCurrentCellValueOnPointerMove';
import tableSaveEditingCellValueIfNeeded from './middleware/tableSaveEditingCellValueIfNeeded';
import rootReducer from '../reducers';

const composeEnhancer = compose;

export const history = createBrowserHistory();

const middleware = [
  expandTableOnPointerMove,
];
if (process.env.NODE_ENV !== 'test') {
  middleware.push(
    routerMiddleware(history),
    setRowUpdateTriggerOnStateChanges,
    copyToRealClipboardOnSetClipboard,
    handleRequestsOnQueueChange,
    clearPointerModifiersOnUndoRedo,
    pushCellHistoryOnValueChanges,
    tableSaveEditingCellValueIfNeeded,

    // make sure this mddileware comes after tableSaveEditingCellValueIfNeeded
    clearDetachmentsCurrentCellValueOnPointerMove,

    // make sure this is the last middleware
    pushRequestOnDataChanges
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
