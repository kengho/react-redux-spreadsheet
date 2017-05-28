import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from '../reducers';
import handleRequestsChanges from './middleware/handleRequestsChanges';
import handleDataChanges from './middleware/handleDataChanges';

const middleware = [thunk];
if (process.env.NODE_ENV !== 'test') {
  middleware.push(
    handleRequestsChanges,
    handleDataChanges // make sure this is the last middleware
  );
}

const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

export default function configureStore(initialState) {
  return createStoreWithMiddleware(rootReducer, initialState);
}
