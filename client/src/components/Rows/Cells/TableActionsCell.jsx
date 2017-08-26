import FileSaver from 'file-saver';
import PropTypes from 'prop-types';
import React from 'react';
import SyncProblem from 'react-icons/lib/md/sync-problem';

import {
  arePropsEqual,
  convert,
} from '../../../core';
import { pushRequest } from '../../../actions/requests';
import datetime from '../../../lib/datetime';
import Menu from '../../Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  shortId: PropTypes.string,
  requests: PropTypes.object.isRequired,
  requestsQueueSize: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
};

class TableActionsCell extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, ['requestsQueueSize']);
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
      id,
      requests,
     } = this.props;

    let output;
    if (requests.queue.length > 0) {
      // Wrapper solves issue with disabled button.
      // https://github.com/angular-ui/bootstrap/issues/1025
      output = (
        <div>
          <div id="sync-problem-icon-wrapper">
            <button
              className="mdl-button mdl-js-button mdl-button--icon"
              disabled
            >
              <SyncProblem />
            </button>
          </div>
          <div
            className="mdl-tooltip mdl-tooltip--large"
            htmlFor="sync-problem-icon-wrapper"
            ref={(c) => { this.tooltip = c; }}
          >
            {'Data sync error. Please don\'t close tab until data is saved.'}
          </div>
        </div>
      );
    } else {
      const tableMenuItems = [
        {
          dialogVariant: 'INFO',
          icon: 'help-outline',
          label: 'Help',
        },
        {
          action: () => this.exportToCSV(),
          icon: 'file-upload',
          label: 'Export to CSV',
        },
        {
          dialogDisableYesButton: true,
          dialogVariant: 'IMPORT',
          icon: 'file-download',
          label: 'Import from CSV',
        },
        {
          action: pushRequest('DELETE', 'destroy'),
          dialogVariant: 'CONFIRM',
          icon: 'close',
          label: 'Delete',
        },
      ];

      output = (
        <div
          className="td table-actions"
          id={id}
          onMouseOver={() => { actions.setHover(id); }}
        >
          <Menu
            actions={actions}
            buttonIcon="more-vert"
            buttonId="table-actions-button"
            hideOnMouseLeave={false}
            menuItems={tableMenuItems}
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
