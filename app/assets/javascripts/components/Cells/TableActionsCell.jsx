import PropTypes from 'prop-types';
import React from 'react';

import { arePropsEqual } from '../../core';
import { pushRequest } from '../../actions/requests';
import Menu from '../Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
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
              <i className="material-icons md-24">sync_problem</i>
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
          icon: 'help_outline',
          label: 'Help',
        },
        {
          action: pushRequest('DELETE'),
          dialogVariant: 'CONFIRM',
          icon: 'close',
          label: 'Delete spreadsheet',
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
            buttonIcon="more_vert"
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
