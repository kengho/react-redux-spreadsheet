import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../core';
import './Row.css';
import Cell from './Cell';
import getAdjacentMenuId from '../lib/getAdjacentMenuId';


// TODO: flow.
//   https://flow.org/en/docs/react/

const propTypes = {
  actions: PropTypes.object.isRequired,
  cells: PropTypes.object.isRequired,
  clipboard: PropTypes.object.isRequired,
  columns: PropTypes.object.isRequired,
  historiesVisibility: PropTypes.object.isRequired,
  hoverColumnId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  menusVisibility: PropTypes.object.isRequired,
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

    // TODO: PERF: anu menu click leads to all Row's re-render
    //   (the same with history).
    //   Possible solution: use rowUpdateTrigger.
    return !arePropsEqual(currentProps, nextProps, [
      'rowUpdateTrigger', // some cells' value changed
      'rowNumber', // add/remove rows
      'hoverColumnId', // hover moves left/right
      'columns', // add/remove columns
      'menusVisibility', // click on menu
      'historiesVisibility', // show/hide cell's history
    ]);
  }

  render() {
    const {
      cells,
      clipboard,
      columns,
      hoverColumnId,
      historiesVisibility,
      menusVisibility,
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

      props.cellMenuVisibility = menusVisibility.get(`${props.cellId}-cell`);
      props.columnMenuVisibility = menusVisibility.get(`${props.cellId}-column`);
      props.rowMenuVisibility = menusVisibility.get(`${props.cellId}-row`);
      props.historyVisibility = historiesVisibility.get(props.cellId);

      // Prevents unneeded re-renders by always passing
      // false when history isn't visible.
      props.history = props.historyVisibility && cell && cell.get('history');

      // Passing history size separate from history for
      // Cell to update when it changes (disables correcponding menu item).
      props.historySize = (
        props.cellMenuVisibility &&
        cell &&
        cell.get('history').size
      ) || 0;

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
