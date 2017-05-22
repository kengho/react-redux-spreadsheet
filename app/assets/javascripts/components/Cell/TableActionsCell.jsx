import PropTypes from 'prop-types';
import React from 'react';

import Menu from '../Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  onMouseOverHandler: PropTypes.func.isRequired,
  requests: PropTypes.object.isRequired,
};

const defaultProps = {
};

class TableActionsCell extends React.Component {
  constructor(props) {
    super(props);

    this.tooltip = null;
  }

  // TODO: recompose/pure?
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;
    const currentRequests = currentProps.requests.toJS();
    const nextRequests = nextProps.requests.toJS();

    if (
      (currentRequests.queue.length === 0 && nextRequests.queue.length > 0) ||
      (currentRequests.queue.length > 0 && nextRequests.queue.length) === 0
    ) {
      return true;
    }

    return false;
  }

  componentDidUpdate() {
    if (this.tooltip) {
      componentHandler.upgradeElement(this.tooltip); // eslint-disable-line no-undef
    }
  }

  render() {
    const requests = this.props.requests.toJS();
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

    const { pushRequest } = this.props.actions;

    const tableMenuItems = [
      {
        action: () => pushRequest('DELETE'),
        confirm: true,
        icon: 'close',
        label: 'Delete spreadsheet',
      },
    ];

    return (
      <div
        className="td table-actions"
        id={this.props.id}
        onMouseOver={this.props.onMouseOverHandler}
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
