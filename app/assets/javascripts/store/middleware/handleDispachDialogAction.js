const handleDispachDialogAction = store => next => action => { // eslint-disable-line consistent-return
  if (action.type !== 'DISPACH_DIALOG_ACTION') {
    return next(action);
  }

  const dialogAction = store.getState().getIn(['dialog', 'action']).toJS();
  // Second condition filters empty action spawned by Dialog with variant: 'INFO'.
  if (dialogAction && Object.keys(dialogAction).length > 0) {
    store.dispatch(dialogAction);
  }

  return next(action);
};

export default handleDispachDialogAction;
