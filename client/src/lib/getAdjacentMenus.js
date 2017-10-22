import { getCellId } from '../core';

// REVIEW: could it be simplified? Should it be tested?
const getAdjacentMenus = (lineRef, lineNumber, rows, columns) => {
  const next = {
    place: lineRef,
  };
  const previous = {
    place: lineRef,
  };

  ['NEXT', 'PREVIOUS'].forEach((direction) => {
    switch (lineRef) {
      case 'COLUMN': {
        switch (direction) {
          case 'NEXT': {
            if (columns.get(lineNumber + 1)) {
              next.cellId = getCellId(rows.getIn([0, 'id']), columns.getIn([lineNumber + 1, 'id']));
            }
            break;
          }
          case 'PREVIOUS': {
            if (lineNumber - 1 >= 0) {
              previous.cellId = getCellId(rows.getIn([0, 'id']), columns.getIn([lineNumber - 1, 'id']));
            } else {
              // TableMenu
              previous.place = 'TABLE';
            }
            break;
          }

          default:
        }

        break;
      }

      case 'ROW': {
        switch (direction) {
          case 'NEXT': {
            // For rows menu direction is inverted for consistency.
            if (lineNumber - 1 >= 0) {
              next.cellId = getCellId(rows.getIn([lineNumber - 1, 'id']), columns.getIn([0, 'id']));
            } else {
              // TableMenu
              next.place = 'TABLE';
            }
            break;
          }
          case 'PREVIOUS': {
            if (rows.get(lineNumber + 1)) {
              previous.cellId = getCellId(rows.getIn([lineNumber + 1, 'id']), columns.getIn([0, 'id']));
            }
            break;
          }

          default:
        }

        break;
      }

      default:
    }

  })

  return { next, previous };
}


export default getAdjacentMenus;
