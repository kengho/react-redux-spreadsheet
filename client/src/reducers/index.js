import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import undoable from 'redux-undo';

import * as ActionTypes from '../actionTypes';
import server from './server';
import settings from './settings';
import table from './table';
import ui from './ui';

export default (history) => combineReducers({
  router: connectRouter(history),
  settings,
  server,
  table: undoable(table, {
    // NOTE: Dispaching ActionTypes.MERGE_SERVER_STATE should save state to history.
    //  https://github.com/omnidan/redux-undo/issues/157#issuecomment-298245650
    filter: (action) => (action.changesData || action.type === ActionTypes.MERGE_SERVER_STATE),

    // For ActionTypes.UNDO and ActionTypes.REDO in table reducer.
    neverSkipReducer: true,
  }),
  ui,
});
