import { getCellId } from '../core';

// REVIEW: could it be simplified? Should it be tested?
const getAdjacentMenuId = (lineRef, lineNumber, direction, rows, columns) => {
  switch (lineRef) {
    case 'COLUMN': {
      switch (direction) {
        case 'NEXT': {
          if (columns.get(lineNumber + 1)) {
            return `${getCellId(rows.getIn([0, 'id']), columns.getIn([lineNumber + 1, 'id']))}-column`;
          }
          return;
        }
        case 'PREVIOUS': {
          if (lineNumber - 1 >= 0) {
            return `${getCellId(rows.getIn([0, 'id']), columns.getIn([lineNumber - 1, 'id']))}-column`;
          } else {
            // TableMenu
            return 'table';
          }
        }

        default:
      }

      break;
    }

    case 'ROW': {
      switch (direction) {
        case 'NEXT': {
          if (lineNumber - 1 >= 0) {
            return `${getCellId(rows.getIn([lineNumber - 1, 'id']), columns.getIn([0, 'id']))}-row`;
          } else {
            // TableMenu
            return 'table';
          }
        }
        case 'PREVIOUS': {
          if (rows.get(lineNumber + 1)) {
            return `${getCellId(rows.getIn([lineNumber + 1, 'id']), columns.getIn([0, 'id']))}-row`;
          }
          return;
        }

        default:
      }

      break;
    }

    default:
  }
}


export default getAdjacentMenuId;
