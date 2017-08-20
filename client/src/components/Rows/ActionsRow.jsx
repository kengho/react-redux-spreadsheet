import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../../core';
import LineActionsCell from './../Cells/LineActionsCell';
import TableActionsCell from './../Cells/TableActionsCell';

const propTypes = {
  actions: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  firstActionsCellIsOnly: PropTypes.bool.isRequired,
  hoverColumnId: PropTypes.string,
  requests: PropTypes.object.isRequired,
  requestsQueueSize: PropTypes.number.isRequired,
  rowId: PropTypes.string.isRequired,
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
      columns,
      firstActionsCellIsOnly,
      hoverColumnId,
      requests,
      requestsQueueSize,
      rowId,
    } = this.props;

    const getActionCellId = (columnIndex) => {
      return getCellId(rowId, columns[columnIndex]);
    };

    const outputCells = [];

    // TableActionsCell.
    outputCells.push(
      <TableActionsCell
        actions={actions}
        id={getActionCellId(0)}
        key={getActionCellId(0)}
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
          actions={actions}
          id={actionCellId}
          isHover={hoverColumnId === columns[columnIndex]}
          isOnly={firstActionsCellIsOnly}
          key={actionCellId}
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
