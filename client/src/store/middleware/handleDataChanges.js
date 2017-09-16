import { pushRequest } from '../../actions/requests';

const handleDataChanges = store => next => action => { // eslint-disable-line consistent-return
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
  const nextTable = store.getState().get('table').present.toJS();

  // TODO: consider storage session data.
  delete nextTable.session;

  // Send new data to server.
  // TODO: reduce traffic amount
  //   (hashdiff? dispatcher on server?).
  const params = { table: JSON.stringify(nextTable) };
  store.dispatch(pushRequest('PATCH', 'update', params));

  return nextAction;
};

export default handleDataChanges;
