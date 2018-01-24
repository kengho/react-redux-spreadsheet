import IconButton from 'material-ui/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import SyncDisabled from 'material-ui-icons/SyncDisabled';
import SyncProblem from 'material-ui-icons/SyncProblem';
import Tooltip from 'material-ui/Tooltip';

const propTypes = {
  requestsQueueLength: PropTypes.number.isRequired,
  sync: PropTypes.bool.isRequired,
};

const defaultProps = {
};

class SyncIndicator extends React.PureComponent {
  render() {
    const {
      requestsQueueLength,
      sync,
    } = this.props;

    let payload;
    if (!sync) {
      // TODO: go online on click.
      payload = (
        <Tooltip disabled title="Synchronization with server is disabled.">
          <IconButton>
            <SyncDisabled />
          </IconButton>
        </Tooltip>
      );
    } else if (requestsQueueLength === 0) {
      payload = '';
    } else {
      payload = (
        <Tooltip disabled title="Synchronization with server is in progress...">
          <IconButton>
            <SyncProblem />
          </IconButton>
        </Tooltip>
      );
    }

    return (
      <div style={{ position: 'absolute', top: '0', right: '0' }}>{payload}</div>
    );
  }
}

SyncIndicator.propTypes = propTypes;
SyncIndicator.defaultProps = defaultProps;

export default SyncIndicator;
