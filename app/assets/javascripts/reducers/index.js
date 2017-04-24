import { combineReducers } from 'redux-immutable';
import table from './table';
import requests from './requests';
import meta from './meta';

const rootReducer = combineReducers({
  meta,
  table,
  requests,
});

export default rootReducer;
