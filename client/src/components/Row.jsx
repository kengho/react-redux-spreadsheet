import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../core';
import Cell from './Cell';
import getAdjacentMenuId from '../lib/getAdjacentMenuId';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cells: PropTypes.object.isRequired,
  clipboard: PropTypes.object.isRequired,
  columns: PropTypes.object.isRequired,
  hoverColumnId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  menu: PropTypes.object.isRequired,
  pointer: PropTypes.object.isRequired,
  rowId: PropTypes.string.isRequired,
  rowNumber: PropTypes.number.isRequired,
  rows: PropTypes.object.isRequired,
  rowUpdateTrigger: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
  hoverColumnId: '',
  rowUpdateTrigger: '',
};

class Row extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, [
      'rowUpdateTrigger', // some cells' value changed
      'rowNumber', // add/remove rows
      'hoverColumnId', // hover moves left/right
      'columns', // add/remove columns
      'menu', // click on menu
    ]);
  }

  render() {
    const {
      cells,
      clipboard,
      columns,
      hoverColumnId,
      menu,
      pointer,
      rowId,
      rowNumber, // uses in both Row and Cell
      rows,

      // Extract this just for it's not passed to Cell.
      rowUpdateTrigger, // eslint-disable-line react/no-unused-prop-types
      ...other,
    } = this.props;

    const outputCells = [];
    for (let columnNumber = 0; columnNumber < columns.size; columnNumber += 1) {
      const columnId = columns.getIn([columnNumber, 'id']);

      const props = {};
      props.cellId = getCellId(rowId, columnId);
      props.columnNumber = columnNumber;
      props.rowNumber = rowNumber;

      const cell = cells.get(props.cellId);
      props.value = cell ? cell.get('value') : undefined;

      props.isPointed = (props.cellId === pointer.get('cellId'));
      props.isEditing = (props.isPointed && (pointer.getIn(['modifiers', 'edit']) === true));
      props.isSelectingOnFocus = (
        props.isPointed && (pointer.getIn(['modifiers', 'selectOnFocus']) === true)
      );
      props.isOnClipboard = (clipboard.get('cells').keySeq().indexOf(props.cellId) !== -1);

      props.columnMenuVisibility = menu.get(`${props.cellId}-column`);
      props.rowMenuVisibility = menu.get(`${props.cellId}-row`);

      props.isColumnOnly = (columns.size === 1);
      props.isRowOnly = (rows.size === 1);

      props.isColumnHover = (hoverColumnId === columnId);

      if (columnNumber === 0) {
        props.previousRowMenuId = getAdjacentMenuId(
          'ROW', rowNumber, 'PREVIOUS', rows, columns
        );
        props.nextRowMenuId = getAdjacentMenuId(
          'ROW', rowNumber, 'NEXT', rows, columns
        );
      }
      if (rowNumber === 0) {
        props.previousColumnMenuId = getAdjacentMenuId(
          'COLUMN', columnNumber, 'PREVIOUS', rows, columns
        );
        props.nextColumnMenuId = getAdjacentMenuId(
          'COLUMN', columnNumber, 'NEXT', rows, columns
        );
      }

      outputCells.push(
        <Cell
          {...props}
          {...other}
          key={props.cellId}
        />
      );
    }

    return (
      <div className="tr">
        {outputCells}
      </div>
    );
  }
}

Row.propTypes = propTypes;
Row.defaultProps = defaultProps;

export default Row;
