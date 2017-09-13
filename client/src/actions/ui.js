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
