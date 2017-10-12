import { tablePushCellHistory } from '../../actions/table';

const pushCellHistoryOnValueChanges = store => next => action => { // eslint-disable-line consistent-return
  if (
    // Only cells' values are saving.
    action.prop !== 'value' &&
    action.type !== 'TABLE/SET_PROP' &&
    action.type !== 'TABLE/DELETE_PROP'
  ) {
    return next(action);
  }

  const historyValue = store.getState().get('table').present.getIn(
    ['data', 'cells', action.cellId, 'value']
  );

  const unixTime = Math.floor(Date.now() / 1000);
  store.dispatch(tablePushCellHistory(action.cellId, historyValue, unixTime));

  return next(action);
};

export default pushCellHistoryOnValueChanges;
