import { combineReducers } from 'redux-immutable';
import undoable from 'redux-undo';

import meta from './meta';
import requests from './requests';
import table from './table';

const rootReducer = combineReducers({
  meta,
  requests,
  table: undoable(table, {
    filter: (action) => {
      // Dispaching 'SET_TABLE_FROM_JSON' saves initial state to history.
      // https://github.com/omnidan/redux-undo/issues/157#issuecomment-298245650
      return (action.changesData || action.type === 'SET_TABLE_FROM_JSON');
    },
  }),
});

export default rootReducer;
