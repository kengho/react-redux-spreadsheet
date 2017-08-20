export function setDialog(dialog) {
  return {
    type: 'SET_DIALOG',
    dialog,
  };
}

export function setDialogVisibility(visibility) {
  return {
    type: 'SET_DIALOG_VISIBILITY',
    visibility,
  };
}

export function dispatchDialogAction() {
  return {
    type: 'DISPACH_DIALOG_ACTION',
  };
}
