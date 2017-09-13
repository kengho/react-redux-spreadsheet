import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../core';
import Menu from './Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  isHover: PropTypes.bool,
  isOnly: PropTypes.bool.isRequired,
  lineNumber: PropTypes.number.isRequired,
  lineRef: PropTypes.string.isRequired,
  menuVisibility: PropTypes.bool,
  rows: PropTypes.array.isRequired,
};

const defaultProps = {
  isHover: false,
  menuVisibility: false,
};

class LineMenu extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, [
      'isHover',
      'isOnly',
      'menuVisibility',
      'lineNumber',
    ]);
  }

  render() {
    const {
      actions,
      cellId,
      columns,
      isHover,
      isOnly,
      lineNumber,
      lineRef,
      rows,
    } = this.props;

    const cellsMenuItems = [];
    if (lineRef === 'ROW') {
      // Don't allow to delete first row/column if there are only one row/column left.
      if (!isOnly) {
        cellsMenuItems.push({
          action: () => actions.reduce(lineNumber, lineRef),
          icon: 'Close',

          // TODO: i18n.
          label: 'Delete row',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.expand(lineNumber, lineRef),
          icon: 'KeyboardArrowUp',
          label: 'Insert row above',
        },
        {
          action: () => actions.expand(lineNumber + 1, lineRef),
          icon: 'KeyboardArrowDown',
          label: 'Insert row below',
        }
      );
    } else if (lineRef === 'COLUMN') {
      if (!isOnly) {
        cellsMenuItems.push({
          action: () => actions.reduce(lineNumber, lineRef),
          icon: 'Close',
          label: 'Delete column',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.expand(lineNumber, lineRef),
          icon: 'ChevronLeft',
          label: 'Insert column at left',
        },
        {
          action: () => actions.expand(lineNumber + 1, lineRef),
          icon: 'ChevronRight',
          label: 'Insert column at right',
        }
      );
    }

    // REVIEW: could it be simplified? Should it be tested?
    const getAdjacentMenuId = (direction) => {
      switch (lineRef) {
        case 'COLUMN': {
          switch (direction) {
            case 'NEXT': {
              if (columns[lineNumber + 1]) {
                return `${getCellId(rows[0].id, columns[lineNumber + 1].id)}-column`;
              }
              return;
            }
            case 'PREVIOUS': {
              if (columns[lineNumber - 1]) {
                return `${getCellId(rows[0].id, columns[lineNumber - 1].id)}-column`;
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
              if (rows[lineNumber - 1]) {
                return `${getCellId(rows[lineNumber - 1].id, columns[0].id)}-row`;
              } else {
                // TableMenu
                return 'table';
              }
            }
            case 'PREVIOUS': {
              if (rows[lineNumber + 1]) {
                return `${getCellId(rows[lineNumber + 1].id, columns[0].id)}-row`;
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

    let previousMenuId = getAdjacentMenuId('PREVIOUS');
    let nextMenuId = getAdjacentMenuId('NEXT');

    return (
      <div
        className={`line-menu ${isHover ? 'hover' : ''}`}
        onMouseOver={() => actions.setHover(cellId)}
      >
        <Menu
          {...this.props}
          icon="MoreVert"
          menuId={`${cellId}-${lineRef.toLowerCase()}`}
          menuItems={cellsMenuItems}
          nextMenuId={nextMenuId}
          previousMenuId={previousMenuId}
        />
      </div>
    );
  }
}

LineMenu.propTypes = propTypes;
LineMenu.defaultProps = defaultProps;

export default LineMenu;
