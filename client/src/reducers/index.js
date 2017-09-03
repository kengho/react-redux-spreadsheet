import { combineReducers } from 'redux-immutable';
import { routerReducer } from 'react-router-redux';
import undoable from 'redux-undo';

import dialog from './dialog';
import landing from './landing';
import meta from './meta';
import requests from './requests';
import table from './table';
import ui from './ui';

const rootReducer = combineReducers({
  dialog,
  landing,
  meta,
  requests,
  table: undoable(table, {
    filter: (action) => {
      // Dispaching 'SET_TABLE_FROM_JSON' saves initial state to history.
      // https://github.com/omnidan/redux-undo/issues/157#issuecomment-298245650
      return (action.changesData || action.type === 'SET_TABLE_FROM_JSON');
    },
  }),
  router: routerReducer,
  ui,
});

export default rootReducer;
