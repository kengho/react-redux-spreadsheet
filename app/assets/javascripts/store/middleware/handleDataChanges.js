import { pushRequest } from '../../actions/requests';

const handleDataChanges = store => next => action => { // eslint-disable-line consistent-return
  if (action.syncWithServer) {
    const getData = (someStore) => {
      return someStore.getState().get('table').get('data').toJS();
    };

    const previousData = getData(store);
    const nextState = next(action);
    const nextData = getData(store);

    // movePointer doesn't change data, unless it expands it,
    // therefore we should check for data updates manually.
    // REVIEW: should we separate affecting and not affecting data movePointer's actions?
    //   This check will be redundant if so.
    //   Or maybe we should add some flag that indicates that data has been changed to state?
    //   (Seems not legit, but we already added syncWithServer flag to actions,
    //   so this middleware lost its transparency already anyway.)
    if (JSON.stringify(nextData) !== JSON.stringify(previousData)) {
      const method = 'PATCH';

      // TODO: reduce traffic amount
      //   (hashdiff? dispatcher on server?).
      const params = { data: JSON.stringify(nextData) };
      store.dispatch(pushRequest(method, undefined, params));

      return nextState;
    }
  } else {
    return next(action);
  }
};

export default handleDataChanges;
