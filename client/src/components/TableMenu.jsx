import FileSaver from 'file-saver';
import IconButton from 'material-ui/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import SyncProblem from 'material-ui-icons/SyncProblem';

import './TableMenu.css';
import { convert } from '../core';
import * as convertFormats from '../convertFormats';
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
  exportTo(outputFormat) {
    const formattedDate = datetime();

    // TODO: uppercase constants.
    const csv = convert(this.props.data, undefined, outputFormat);

    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `${formattedDate} ${this.props.shortId}.${outputFormat.toLowerCase()}`);
  }

  render() {
    // Extracting props.
    const {
      canRedo,
      canUndo,
      requestsQueueLength,
      ...other,
    } = this.props;

    // Non-extracting props (should be passed to children as well).
    const {
      actions, // uses in Menu
    } = this.props;

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
    } else {
      const tableMenuItems = [
        {
          dialogVariant: 'INFO',
          icon: 'HelpOutline',
          label: 'Help',
        },
        // TODO: nested menu.
        //   https://github.com/callemall/material-ui/issues/8152
        {
          action: () => this.exportTo(convertFormats.CSV),
          icon: 'FileUpload',
          label: 'Export to CSV',
        },
        {
          action: () => this.exportTo(convertFormats.JSON),
          icon: 'FileUpload',
          label: 'Export to JSON',
        },
        {
          dialogDisableYesButton: true,
          dialogVariant: 'IMPORT',
          icon: 'FileDownload',
          label: 'Import from file',
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
          dialogVariant: 'DESTROY_SPREADSHEET',
          icon: 'Delete',
          label: 'Delete',
        },
      ];

      output = (
        <Menu
          icon="Menu"
          menuItems={tableMenuItems}
          place="TABLE"
          {...other}
        />
      );
    }

    return (
      <div className="table-menu">
        {output}
      </div>
    );
  }
}

TableMenu.propTypes = propTypes;
TableMenu.defaultProps = defaultProps;

export default TableMenu;
