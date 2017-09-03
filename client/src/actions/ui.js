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
