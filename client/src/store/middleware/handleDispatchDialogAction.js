const handleDispatchDialogAction = store => next => action => { // eslint-disable-line consistent-return
  if (action.type !== 'DISPATCH_DIALOG_ACTION') {
    return next(action);
  }

  const dialogAction = store.getState().getIn(['ui', 'dialog', 'action']).toJS();

  // Second condition filters empty action spawned by Dialog with variant: 'INFO'.
  if (dialogAction && Object.keys(dialogAction).length > 0) {
    store.dispatch(dialogAction);
  }

  return next(action);
};

export default handleDispatchDialogAction;
