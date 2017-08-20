import { getRowId } from '../../core';
import { pushRequest } from '../../actions/requests';
import { toggleRowUpdateTrigger } from '../../actions/table';

const handleDataChanges = store => next => action => { // eslint-disable-line consistent-return
  // Don't fire before server data populates state.
  if (!store.getState().get('table').present) {
    return next(action);
  }

  if (!action.changesData) {
    return next(action);
  }

  const getTable = (someStore) => {
    const table = someStore.getState().get('table').present.toJS();

    // TODO: consider storage session data.
    delete table.session;

    return table;
  };

  // Middleware should apply after dispatcher changes state.
  const nextAction = next(action);

  // Get new data.
  const nextTable = getTable(store);

  // Send new data to server.
  // TODO: reduce traffic amount
  //   (hashdiff? dispatcher on server?).
  const params = { table: JSON.stringify(nextTable) };
  store.dispatch(pushRequest('PATCH', 'update', params));

  // Mark row as update-needed because we don't want
  // to calculate all row's props on each Spreadsheet render().
  // REVIEW: since we've come so far, wouldn't be better to apply
  //   this stategy to all actions with cellId prop in it?
  //   (Implies some refactoring though.)
  if (action.triggersRowUpdate && action.cellId) {
    store.dispatch(toggleRowUpdateTrigger(getRowId(action.cellId)));
  }

  return nextAction;
};

export default handleDataChanges;