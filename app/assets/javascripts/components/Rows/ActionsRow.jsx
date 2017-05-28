import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../../core';
import LineActionsCell from './../Cells/LineActionsCell';
import TableActionsCell from './../Cells/TableActionsCell';


const propTypes = {
  columns: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  requests: PropTypes.object.isRequired,
  requestsQueueSize: PropTypes.number.isRequired,
  rowId: PropTypes.string.isRequired,
  firstActionsCellIsOnly: PropTypes.bool.isRequired,
  hoverColumnId: PropTypes.string,
};

const defaultProps = {
  hoverColumnId: '',
};

class ActionsRow extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps,
      ['hoverColumnId', 'firstActionsCellIsOnly', 'requestsQueueSize']
    );
  }

  render() {
    const {
      actions,
      requests,
      rowId,
      hoverColumnId,
      columns,
      firstActionsCellIsOnly,
      requestsQueueSize,
    } = this.props;

    const getActionCellId = (columnIndex) => {
      return getCellId(rowId, columns[columnIndex]);
    };

    const outputCells = [];

    // TableActionsCell.
    outputCells.push(
      <TableActionsCell
        id={getActionCellId(0)}
        key={getActionCellId(0)}
        actions={actions}
        requests={requests}
        requestsQueueSize={requestsQueueSize}
      />
    );

    // Empty cell.
    outputCells.push(
      <div
        className="td empty"
        id={getActionCellId(1)}
        key={getActionCellId(1)}
      />
    );

    // The rest.
    for (let columnIndex = 2; columnIndex < columns.length; columnIndex += 1) {
      const actionCellId = getActionCellId(columnIndex);

      outputCells.push(
        <LineActionsCell
          id={actionCellId}
          key={actionCellId}
          actions={actions}
          isHover={hoverColumnId === columns[columnIndex]}
          isOnly={firstActionsCellIsOnly}
          pos={[-2, columnIndex - 2]}
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

ActionsRow.propTypes = propTypes;
ActionsRow.defaultProps = defaultProps;

export default ActionsRow;
