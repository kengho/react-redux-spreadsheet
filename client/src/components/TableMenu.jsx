import FileSaver from 'file-saver';
import IconButton from 'material-ui/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import SyncProblem from 'material-ui-icons/SyncProblem';

import {
  arePropsEqual,
  convert,
} from '../core';
import { pushRequest } from '../actions/requests';
import datetime from '../lib/datetime';
import Menu from './Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  firstCellId: PropTypes.string.isRequired,
  menuVisibility: PropTypes.bool,
  requests: PropTypes.object.isRequired,
  shortId: PropTypes.string.isRequired,
};

const defaultProps = {
  menuVisibility: false,
};

class TableMenu extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, [
      'requests',
      'menuVisibility',
      'firstCellId', // for nextMenuId and previousMenuId
    ]);
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
      requests,
      firstCellId,
    } = this.props;

    let classnames = [];
    let output;
    if (requests.queue.length > 0) {
      // TODO: return tooltip.
      // tooltip="Data sync error. Please don't close tab until data is saved"
      // Wrapper solves issue with disabled button.
      // https://github.com/angular-ui/bootstrap/issues/1025
      // className="mdl-button mdl-js-button mdl-button--icon"
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
          action: pushRequest('DELETE', 'destroy'),
          dialogVariant: 'CONFIRM',
          icon: 'Close',
          label: 'Delete',
        },
      ];

      const nextMenuId = `${firstCellId}-column`;
      const previousMenuId = `${firstCellId}-row`;

      output = (
        <Menu
          {...this.props}
          icon="MoreVert"
          menuId="table"
          menuItems={tableMenuItems}
          nextMenuId={nextMenuId}
          previousMenuId={previousMenuId}
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
