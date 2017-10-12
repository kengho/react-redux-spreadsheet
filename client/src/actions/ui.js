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

// TODO: group somehow all popup-related actions so we can close they all at once.
//   Bad news is that cellId !== menuId, that's inconvinient.
export function uiOpen(uiKind, cellId) {
  return {
    type: 'UI/OPEN',
    uiKind,
    cellId,
  };
}

export function uiClose(uiKind, cellId) {
  return {
    type: 'UI/CLOSE',
    uiKind,
    cellId,
  };
}

export function uiCloseAll(uiKind) {
  let uiKinds;
  if (Array.isArray(uiKind)) {
    uiKinds = uiKind;
  } else {
    uiKinds = [uiKind];
  }

  return {
    type: 'UI/CLOSE_ALL',
    uiKinds,
  };
}
