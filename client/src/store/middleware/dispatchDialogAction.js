// TODO: get rid of it. If Dialog opens with MenuItem, pass only dialog variant
//   and let Dialog do the rest using regular functions.
const dispatchDialogAction = store => next => action => { // eslint-disable-line consistent-return
  if (action.type !== 'UI/DISPATCH_DIALOG_ACTION') {
    return next(action);
  }

  const dialogAction = store.getState().getIn(['ui', 'dialog', 'action']);

  // Second condition filters empty action spawned by Dialog with variant: 'INFO'.
  if (dialogAction && dialogAction.keySeq().size > 0) {
    store.dispatch(dialogAction.toJS());
  }

  return next(action);
};

export default dispatchDialogAction;
