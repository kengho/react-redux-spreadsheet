import FileSaver from 'file-saver';
import IconButton from 'material-ui/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import SyncProblem from 'material-ui-icons/SyncProblem';

import {
  arePropsEqual,
  convert,
  getCellId,
} from '../../../core';
import { FICTIVE_LINES_NUMBER } from '../../../containers/Spreadsheet';
import { pushRequest } from '../../../actions/requests';
import datetime from '../../../lib/datetime';
import Menu from '../../Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  data: PropTypes.object.isRequired,
  requests: PropTypes.object.isRequired,
  rows: PropTypes.array.isRequired,
  shortId: PropTypes.string,
};

const defaultProps = {
};

class TableActionsCell extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, ['requests', 'menu']);
  }

  componentDidUpdate() {
    if (this.tooltip) {
      componentHandler.upgradeElement(this.tooltip); // eslint-disable-line no-undef
    }
  }

  exportToCSV() {
    const formattedDate = datetime();
    const csv = convert(this.props.data, {
      inputFormat: 'object',
      outputFormat: 'csv',
    });

    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `${formattedDate} ${this.props.shortId}.csv`);
  }

  render() {
    const {
      actions,
      cellId,
      columns,
      requests,
      rows,
     } = this.props;

    let output;
    if (requests.queue.length > 0) {
      // TODO: return tooltip.
      // tooltip="Data sync error. Please don't close tab until data is saved"
      // Wrapper solves issue with disabled button.
      // https://github.com/angular-ui/bootstrap/issues/1025
      // className="mdl-button mdl-js-button mdl-button--icon"
      output = (
        <div>
          <IconButton disabled>
            <SyncProblem size={24} />
          </IconButton>
        </div>
      );
    } else {
      const tableMenuItems = [
        {
          dialogVariant: 'INFO',
          icon: 'HelpOutline',
          label: 'Help',
        },
        {
          action: () => this.exportToCSV(),
          icon: 'FileUpload',
          label: 'Export to CSV',
        },
        {
          dialogDisableYesButton: true,
          dialogVariant: 'IMPORT',
          icon: 'FileDownload',
          label: 'Import from CSV',
        },
        {
          action: pushRequest('DELETE', 'destroy'),
          dialogVariant: 'CONFIRM',
          icon: 'Close',
          label: 'Delete',
        },
      ];

      const nextCellId = getCellId(rows[0], columns[FICTIVE_LINES_NUMBER]);
      const previousCellId = getCellId(rows[FICTIVE_LINES_NUMBER], columns[0]);

      output = (
        <div
          className="td table-actions"
          id={cellId}
          onMouseOver={() => actions.setHover(cellId)}
        >
          <Menu
            {...this.props}
            icon="MoreVert"
            menuItems={tableMenuItems}
            nextCellId={nextCellId}
            previousCellId={previousCellId}
          />
        </div>
      );
    }

    return output;
  }
}

TableActionsCell.propTypes = propTypes;
TableActionsCell.defaultProps = defaultProps;

export default TableActionsCell;
