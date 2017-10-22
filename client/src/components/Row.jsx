import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../core';
import './Row.css';
import Cell from './Cell';
import getAdjacentMenus from '../lib/getAdjacentMenus';


// TODO: flow.
//   https://flow.org/en/docs/react/

const propTypes = {
  actions: PropTypes.object.isRequired,
  cells: PropTypes.object.isRequired,
  clipboard: PropTypes.object.isRequired,
  columns: PropTypes.object.isRequired,
  currentUi: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]).isRequired,
  hoverColumnId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
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
      'columns', // add/remove columns
      'hoverColumnId', // hover moves left/right
      'rowNumber', // add/remove rows
      'rowUpdateTrigger', // some cells' value changed
    ]);
  }

  render() {
    const {
      cells,
      clipboard,
      columns,
      hoverColumnId,
      pointer,
      rowId,
      rowNumber, // uses in both Row and Cell
      rows,

      // Extract rowUpdateTrigger just for it not to be passed to Cell.
      rowUpdateTrigger, // eslint-disable-line react/no-unused-prop-types
      currentUi, // uses in both Row and Cell
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

      props.currentUi = currentUi;

      props.historyVisibility =
        currentUi &&
        currentUi.get('visibility') &&
        currentUi.get('kind') === 'HISTORY' &&
        currentUi.get('cellId') === props.cellId;
      props.history = props.historyVisibility && cell && cell.get('history');

      const cellMenuVisibility =
        currentUi &&
        currentUi.get('visibility') &&
        currentUi.get('kind') === 'MENU' &&
        currentUi.get('place') === 'CELL' &&
        currentUi.get('cellId') === props.cellId;

      // Passing history size separate from history for
      // Cell to update when it changes (disables corresponding menu item).
      props.historySize = (
        cellMenuVisibility &&
        cell &&
        cell.get('history').size
      ) || 0;

      props.isColumnOnly = (columns.size === 1);
      props.isRowOnly = (rows.size === 1);

      props.isColumnHover = (hoverColumnId === columnId);

      if (columnNumber === 0) {
        const adjacentRowMenus = getAdjacentMenus(
          'ROW', rowNumber, rows, columns
        );
        props.nextRowMenuCellId = adjacentRowMenus.next.cellId;
        props.nextRowMenuPlace = adjacentRowMenus.next.place;
        props.previousRowMenuCellId = adjacentRowMenus.previous.cellId;
        props.previousRowMenuPlace = adjacentRowMenus.previous.place;
      }
      if (rowNumber === 0) {
        const adjacentColumnMenus = getAdjacentMenus(
          'COLUMN', columnNumber, rows, columns
        );
        props.nextColumnMenuCellId = adjacentColumnMenus.next.cellId;
        props.nextColumnMenuPlace = adjacentColumnMenus.next.place;
        props.previousColumnMenuCellId = adjacentColumnMenus.previous.cellId;
        props.previousColumnMenuPlace = adjacentColumnMenus.previous.place;
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
