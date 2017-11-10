// Changing this state branch props doesn't affects on Spreadsheet re-render via connect().
// Such changes could be handeled only in middleware.
// (using in client/src/store/middleware/saveEditingCellValueOnPointerMove.js)

export function detachmentsSetCurrentCellValue(currentCellValue) { // eslint-disable-line import/prefer-default-export
  return {
    type: 'DETACHMENTS/SET_CURRENT_CELL_VALUE',
    currentCellValue,
  };
}
