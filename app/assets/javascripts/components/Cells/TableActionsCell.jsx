import PropTypes from 'prop-types';
import React from 'react';

import { arePropsEqual } from '../../core';
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
  constructor(props) {
    super(props);

    this.tooltip = null;
  }

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

    if (requests.queue.length > 0) {
      // Wrapper solves issue with disabled button.
      // https://github.com/angular-ui/bootstrap/issues/1025
      return (
        <div>
          <div id="sync-problem-icon-wrapper">
            <button
              disabled
              className="mdl-button mdl-js-button mdl-button--icon"
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
    }

    const tableMenuItems = [
      {
        action: () => actions.pushRequest('DELETE'),
        confirm: true,
        icon: 'close',
        label: 'Delete spreadsheet',
      },
    ];

    return (
      <div
        className="td table-actions"
        id={id}
        onMouseOver={() => { actions.setHover(id); }}
      >
        <Menu
          buttonIcon="more_vert"
          buttonId="table-actions-button"
          hideOnMouseLeave={false}
          menuItems={tableMenuItems}
        />
      </div>
    );
  }
}

TableActionsCell.propTypes = propTypes;
TableActionsCell.defaultProps = defaultProps;

export default TableActionsCell;
