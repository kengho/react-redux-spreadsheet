// REVIEW: should we put dialog to uiOpen/uiClose?
export function uiSetDialog(dialog) {
  return {
    type: 'UI/SET_DIALOG',
    dialog,
  };
}

export function uiCloseDialog() {
  return {
    type: 'UI/CLOSE_DIALOG',
  };
}

export function uiDispatchDialogAction() {
  return {
    type: 'UI/DISPATCH_DIALOG_ACTION',
  };
}

export function uiOpen(kind, cellId = null, place = 'CELL') {
  return {
    type: 'UI/OPEN',
    triggersRowUpdate: true,
    cellIdPath: ['current', 'cellId'],
    propsComparePaths: [['current', 'visibility']],
    kind,
    cellId,
    place,
  };
}

export function uiClose() {
  return {
    type: 'UI/CLOSE',
    triggersRowUpdate: true,
    cellIdPath: ['current', 'cellId'],
    propsComparePaths: [['current', 'visibility']],
  };
}
