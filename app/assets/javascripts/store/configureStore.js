import { createStore, applyMiddleware } from 'redux';

import handleDataChanges from './middleware/handleDataChanges';
import handlePointerChanges from './middleware/handlePointerChanges';
import handleRequestsChanges from './middleware/handleRequestsChanges';
import handleUndoRedo from './middleware/handleUndoRedo';
import rootReducer from '../reducers';

const middleware = [
  handlePointerChanges,
];
if (process.env.NODE_ENV !== 'test') {
  middleware.push(
    handleRequestsChanges,
    handleUndoRedo,
    handleDataChanges // make sure this is the last middleware
  );
}

const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

export default function configureStore(initialState) {
  return createStoreWithMiddleware(rootReducer, initialState);
}
