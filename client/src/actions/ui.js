export function openMenu(menuId) {
  return {
    type: 'OPEN_MENU',
    menuId,
  };
}

export function closeMenu(menuId) {
  return {
    type: 'CLOSE_MENU',
    menuId,
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

// TODO: use menu's actions for they are practiaclly identical.
// TODO: group somehow all popup-related actions so we can close they all at once.
//   Bad news is that cellId !== menuId, that's inconvinient.
export function openCellHistory(cellId) {
  return {
    type: 'OPEN_CELL_HISTORY',
    cellId,
  };
}

export function closeCellHistory(cellId) {
  return {
    type: 'CLOSE_CELL_HISTORY',
    cellId,
  };
}

export function closeAllCellHistories() {
  return {
    type: 'CLOSE_ALL_CELL_HISTORIES',
  };
}
