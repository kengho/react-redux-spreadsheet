import produce from 'immer';

import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

// REVIEW: should such small reducers be moved to "reducers/index.js"
//   w/o creating separate files for them?
export default (state = initialState().server, action) => produce(state, draft => {
  // eslint-disable-next-line default-case
  switch (action.type) {
    case ActionTypes.UPDATE: {
      if (action.branch === 'server') {
        action.updater(draft);
      };
      break;
    }
  }
});
