import FileSaver from 'file-saver';
import IconButton from 'material-ui/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import SyncProblem from 'material-ui-icons/SyncProblem';

import './TableMenu.css';
import { convert } from '../core';
import { requestsPush } from '../actions/requests';
import datetime from '../lib/datetime';
import Menu from './Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  canRedo: PropTypes.bool.isRequired,
  canUndo: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  requestsQueueLength: PropTypes.number.isRequired,
  shortId: PropTypes.string.isRequired,
};

const defaultProps = {
};

class TableMenu extends React.PureComponent {
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
      actions, // uses in TableMenu and Menu
      canRedo,
      canUndo,
      requestsQueueLength,
      ...other,
    } = this.props;

    let classnames = [];
    let output;
    if (requestsQueueLength > 0) {
      // TODO: return tooltip.
      //   tooltip="Data sync error. Please don't close tab until data is saved"
      //   NOTE: Use wrapper to solve issue with disabled button.
      //     https://github.com/angular-ui/bootstrap/issues/1025
      output = (
        <IconButton disabled>
          <SyncProblem size={24} />
        </IconButton>
      );
      classnames = ['sync-problem'];
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
          action: () => actions.undo(),
          icon: 'Undo',
          label: 'Undo (Ctrl+Z)',
          disabled: !canUndo,
        },
        {
          action: () => actions.redo(),
          icon: 'Redo',
          label: 'Redo (Ctrl+Y)',
          disabled: !canRedo,
        },
        {
          action: requestsPush('DELETE', 'destroy'),
          dialogVariant: 'CONFIRM',
          icon: 'Delete',
          label: 'Delete',
        },
      ];

      output = (
        <Menu
          {...other}
          actions={actions}
          icon="Menu"
          menuItems={tableMenuItems}
          place="TABLE"
        />
      );
    }

    return (
      <div className={`table-menu ${classnames.join(' ')}`}>
        {output}
      </div>
    );
  }
}

TableMenu.propTypes = propTypes;
TableMenu.defaultProps = defaultProps;

export default TableMenu;
