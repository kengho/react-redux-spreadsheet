import { convertTableToPlainArray } from '../../core';
import { ROW, COLUMN } from '../../constants';
import * as TableActions from '../table';

export const getRowsList = (store) => store.getState().table.present.major.layout[ROW].list;
export const getColumnsList = (store) => store.getState().table.present.major.layout[COLUMN].list;

export const setCellsValues = (store, cellsArray) => {
  // Example for cellsArray:
  // const cellsArray = [
  //   ['00', '' ],
  //   ['' , '11'],
  // ];

  store.dispatch(TableActions.insertLines({ lineType: ROW, index: cellsArray.length - 1 }));
  store.dispatch(TableActions.insertLines({ lineType: COLUMN, index: cellsArray[0].length - 1 }));
  cellsArray.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      store.dispatch(TableActions.setProp({
        [ROW]: {
          index: rowIndex,
        },
        [COLUMN]: {
          index: columnIndex,
        },
        prop: 'value',
        value,
      }));
    });
  });

  return store;
}

export const getPointer = (store) => store.getState().table.present.major.session.pointer;

export const getPointerPosition = (store) => {
  const pointer = getPointer(store);
  return {
    rowIndex: pointer[ROW].index,
    columnIndex: pointer[COLUMN].index,
  };
};

export const getSelection = (store) => store.getState().table.present.major.session.selection;

export const getCellsValues = (store) =>
  convertTableToPlainArray({ table: store.getState().table.present.major });
