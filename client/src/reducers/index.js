import { combineReducers } from 'redux-immutable';
import { routerReducer } from 'react-router-redux';
import undoable from 'redux-undo';

import * as ActionTypes from '../actionTypes';
import detachments from './detachments';
import landing from './landing';
import meta from './meta';
import requests from './requests';
import settings from './settings';
import table from './table';
import ui from './ui';

const rootReducer = combineReducers({
  detachments,
  landing,
  meta,
  requests,
  settings,
  table: undoable(table, {
    filter: (action) => {
      // Dispaching ActionTypes.SET_TABLE_FROM_JSON saves initial state to history.
      // https://github.com/omnidan/redux-undo/issues/157#issuecomment-298245650
      return (action.changesData || action.type === ActionTypes.SET_TABLE_FROM_JSON);
    },

    // For ActionTypes.UNDO and ActionTypes.REDO in table reducer.
    neverSkipReducer: true,
  }),
  router: routerReducer,
  ui,
});

export default rootReducer;
