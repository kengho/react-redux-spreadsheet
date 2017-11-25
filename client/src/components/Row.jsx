import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../core';
import './Row.css';
import Cell from './Cell';

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
    // Extracting props.
    const {
      cells,
      clipboard,
      columns,
      hoverColumnId,
      pointer,
      rowId,
      rows,

      // Extract just for it not to be passed to Cell.
      rowUpdateTrigger, // eslint-disable-line react/no-unused-prop-types
      ...other,
    } = this.props;

    // Non-extracting props (should be passed to children as well).
    const {
      currentUi, // uses in Cell
    } = this.props;

    const outputCells = [];
    for (let columnNumber = 0; columnNumber < columns.size; columnNumber += 1) {
      const props = {};

      props.columnNumber = columnNumber;

      const columnId = columns.getIn([columnNumber, 'id']);
      props.cellId = getCellId(rowId, columnId);

      const cell = cells.get(props.cellId);
      props.value = cell ? cell.get('value') : undefined;

      props.isPointed = (props.cellId === pointer.get('cellId'));
      props.isEditing = (props.isPointed && (pointer.getIn(['modifiers', 'edit']) === true));
      props.isSelectingOnFocus = (
        props.isPointed && (pointer.getIn(['modifiers', 'selectOnFocus']) === true)
      );
      props.isOnClipboard = (clipboard.get('cells').keySeq().includes(props.cellId));

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
        cell.get('history') &&
        cell.get('history').size
      ) || 0;

      props.isColumnOnly = (columns.size === 1);
      props.isRowOnly = (rows.size === 1);

      props.isColumnHover = (hoverColumnId === columnId);

      outputCells.push(
        <Cell
          key={props.cellId}
          {...props}
          {...other}
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
