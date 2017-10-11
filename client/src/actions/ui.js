export function setDialog(dialog) {
  return {
    type: 'SET_DIALOG',
    dialog,
  };
}

export function openDialog() {
  return {
    type: 'OPEN_DIALOG',
  };
}

export function closeDialog() {
  return {
    type: 'CLOSE_DIALOG',
  };
}

export function dispatchDialogAction() {
  return {
    type: 'DISPATCH_DIALOG_ACTION',
  };
}

// TODO: group somehow all popup-related actions so we can close they all at once.
//   Bad news is that cellId !== menuId, that's inconvinient.
export function open(uiKind, cellId) {
  return {
    type: 'OPEN',
    uiKind,
    cellId,
  };
}

export function close(uiKind, cellId) {
  return {
    type: 'CLOSE',
    uiKind,
    cellId,
  };
}

// TODO: allow array and use in Spreadsheet.
export function closeAll(uiKind) {
  return {
    type: 'CLOSE_ALL',
    uiKind,
  };
}
