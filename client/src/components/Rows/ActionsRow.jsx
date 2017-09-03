import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../../core';
import { FICTIVE_LINES_NUMBER } from '../../containers/Spreadsheet';
import LineActionsCell from './Cells/LineActionsCell';
import TableActionsCell from './Cells/TableActionsCell';

const propTypes = {
  columns: PropTypes.array.isRequired,
  hoverColumnId: PropTypes.string,
  menu: PropTypes.object.isRequired,
  rowId: PropTypes.string.isRequired,
  shortId: PropTypes.string.isRequired,
};

const defaultProps = {
  hoverColumnId: '',
};

class ActionsRow extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps,
      ['hoverColumnId', 'requests', 'columns', 'menu']
    );
  }

  render() {
    const {
      columns,
      hoverColumnId,
      menu,
      rowId,
    } = this.props;

    const getActionCellId = (columnIndex) => {
      return getCellId(rowId, columns[columnIndex]);
    };

    const outputCells = [];

    // TableActionsCell.
    outputCells.push(
      <TableActionsCell
        {...this.props}
        cellId={getActionCellId(0)}
        key={getActionCellId(0)}
        menuVisibility={menu[getActionCellId(0)]}
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
    for (let columnIndex = FICTIVE_LINES_NUMBER; columnIndex < columns.length; columnIndex += 1) {
      const actionCellId = getActionCellId(columnIndex);

      outputCells.push(
        <LineActionsCell
          {...this.props}
          cellId={actionCellId}
          isHover={hoverColumnId === columns[columnIndex]}
          isOnly={columns.length === FICTIVE_LINES_NUMBER + 1}
          key={actionCellId}
          menuVisibility={menu[actionCellId]}
          pos={[-FICTIVE_LINES_NUMBER, columnIndex - FICTIVE_LINES_NUMBER]}
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
