export function openMenu(cellId) {
  return {
    type: 'OPEN_MENU',
    cellId,
  };
}

export function closeMenu(cellId) {
  return {
    type: 'CLOSE_MENU',
    cellId,
  };
}

export function closeAllMenus() {
  return {
    type: 'CLOSE_ALL_MENUS',
  };
}

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
