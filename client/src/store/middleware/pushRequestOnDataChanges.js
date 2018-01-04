import { requestsPush } from '../../actions/requests';
import serverSyncParams from '../../lib/serverSyncParams';

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
  const nextTable = store.getState().get('table').present;
  const nextSettings = store.getState().get('settings');

  // Send new data to server.
  // TODO: reduce traffic amount
  //   (hashdiff? dispatcher on server?).
  const params = serverSyncParams(nextTable, nextSettings);
  store.dispatch(requestsPush('PATCH', 'update', params));

  return nextAction;
};

export default pushRequestOnDataChanges;
