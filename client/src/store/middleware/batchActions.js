import { batchActions } from 'redux-batched-actions';

import * as ActionTypes from '../../actionTypes';

export default store => next => action => {
  if (action.type === ActionTypes.BATCH_ACTIONS) {
    store.dispatch(batchActions(action.actions));
  }

  return next(action);
};
