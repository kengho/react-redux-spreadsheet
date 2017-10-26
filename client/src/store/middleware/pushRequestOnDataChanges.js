import { List } from 'immutable';

import { requestsPush } from '../../actions/requests';

const pushRequestOnDataChanges = store => next => action => { // eslint-disable-line consistent-return
  // Don't fire before server data populates state.
  if (!store.getState().get('table').present) {
    return next(action);
  }

  if (!action.changesData) {
    return next(action);
  }

  // Middleware should apply after dispatcher changes state.
  const nextAction = next(action);

  // Get new data.
  // NOTE: we don't need toJS() here until replacer is immutable list.
  //   https://facebook.github.io/immutable-js/#converts-back-to-raw-javascript-objects-
  const nextTable = store.getState().get('table').present;

  // TODO: consider storing session data.
  const syncingStateBranches = List(['data']);

  // Send new data to server.
  // TODO: reduce traffic amount
  //   (hashdiff? dispatcher on server?).
  const params = { table: JSON.stringify(nextTable, syncingStateBranches) };
  store.dispatch(requestsPush('PATCH', 'update', params));

  return nextAction;
};

export default pushRequestOnDataChanges;
