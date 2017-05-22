import { pushRequest } from '../../actions/requests';

const handleDataChanges = store => next => action => { // eslint-disable-line consistent-return
  if (action.syncWithServer) {
    const getTable = (someStore) => {
      const table = someStore.getState().get('table').toJS();

      // TODO: consider storage session data.
      delete table.session;

      return table;
    };

    const previousTable = getTable(store);
    const nextState = next(action);
    const nextTable = getTable(store);

    // movePointer doesn't change data, unless it expands it,
    // therefore we should check for data updates manually.
    // REVIEW: should we separate affecting and not affecting data movePointer's actions?
    //   This check will be redundant if so.
    //   Or maybe we should add some flag that indicates that data has been changed to state?
    //   (Seems not legit, but we already added syncWithServer flag to actions,
    //   so this middleware lost its transparency already anyway.)
    if (JSON.stringify(nextTable) !== JSON.stringify(previousTable)) {
      const method = 'PATCH';

      // TODO: reduce traffic amount
      //   (hashdiff? dispatcher on server?).
      const params = { table: JSON.stringify(nextTable) };
      store.dispatch(pushRequest(method, undefined, params));

      return nextState;
    }
  } else {
    return next(action);
  }
};

export default handleDataChanges;
