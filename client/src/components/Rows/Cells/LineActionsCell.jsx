import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getColumnNumber,
  getLineRef,
  getRowNumber,
  getCellId,
} from '../../../core';
import Menu from '../../Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  isHover: PropTypes.bool,
  isOnly: PropTypes.bool.isRequired,
  pos: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};

const defaultProps = {
  isHover: false,
};

class LineActionsCell extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, [
      'isHover',
      'isOnly',
      'pos',
      'menu',
    ]);
  }

  render() {
    const {
      actions,
      cellId,
      columns,
      isHover,
      isOnly,
      pos,
      rows,
    } = this.props;

    const lineRef = getLineRef(pos);

    const cellsMenuItems = [];
    if (lineRef === 'ROW') {
      // Don't allow to delete first row/column if there are only one row/column left.
      if (!isOnly) {
        cellsMenuItems.push({
          action: () => actions.reduce(pos),
          icon: 'Close',

          // TODO: i18n.
          label: 'Delete row',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.expand(pos),
          icon: 'KeyboardArrowUp',
          label: 'Insert row above',
        },
        {
          action: () => actions.expand([getRowNumber(pos) + 1, getColumnNumber(pos)]),
          icon: 'KeyboardArrowDown',
          label: 'Insert row below',
        }
      );
    } else if (lineRef === 'COLUMN') {
      if (!isOnly) {
        cellsMenuItems.push({
          action: () => actions.reduce(pos),
          icon: 'Close',
          label: 'Delete column',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.expand(pos),
          icon: 'ChevronLeft',
          label: 'Insert column at left',
        },
        {
          action: () => actions.expand([getRowNumber(pos), getColumnNumber(pos) + 1]),
          icon: 'ChevronRight',
          label: 'Insert column at right',
        }
      );
    }

    // TODO: to core.js; test.
    //   (Should accept realPos as param. skipping FICTIVE_LINES_NUMBER in core.js.)
    //   Ending (skipping empty cells) should be here.
    const getAdjacentCellId = (direction) => {
      const FICTIVE_LINES_NUMBER = 2;
      const directionMap = {
        'ROW': 0,
        'COLUMN': 1,
      };

      const incrementMap = {
        'NEXT': {
          'ROW': -1,
          'COLUMN': 1,
        },
        'PREVIOUS': {
          'ROW': 1,
          'COLUMN': -1,
        },
      };

      let nextPos = [...pos];
      const incrementingLineRef = directionMap[lineRef];
      nextPos[incrementingLineRef] += incrementMap[direction][lineRef];

      const realPos = nextPos.map((lineIndex) => lineIndex + FICTIVE_LINES_NUMBER);
      if (rows[realPos[0]] && columns[realPos[1]]) {
        return getCellId(rows[realPos[0]], columns[realPos[1]]);
      }
    }

    let previousCellId = getAdjacentCellId('PREVIOUS');
    let nextCellId = getAdjacentCellId('NEXT');

    // Skip empty cell...
    if (previousCellId === getCellId(rows[0], columns[1])) {
      // ... straight to TableActionsCell.
      previousCellId = getCellId(rows[0], columns[0]);
    }

    // And do the same for nextCellId while going through columns.
    if (nextCellId === getCellId(rows[1], columns[0])) {
      nextCellId = getCellId(rows[0], columns[0]);
    }

    return (
      <div
        className={`td line-actions ${lineRef.toLowerCase()} ${isHover ? 'hover' : ''}`}
        onMouseOver={() => actions.setHover(cellId)}
      >
        <Menu
          {...this.props}
          icon="MoreVert"
          menuItems={cellsMenuItems}
          nextCellId={nextCellId}
          previousCellId={previousCellId}
        />
      </div>
    );
  }
}

LineActionsCell.propTypes = propTypes;
LineActionsCell.defaultProps = defaultProps;

export default LineActionsCell;
