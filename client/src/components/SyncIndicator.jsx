import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';

import './SyncIndicator.css';

const propTypes = {
  server: PropTypes.object.isRequired
};

class SyncIndicator extends React.PureComponent {
  render() {
    const server = this.props.server;

    const requestFailed = server.get('requestFailed');
    const syncInProgress = server.get('syncInProgress');
    const sync = server.get('sync');

    let indicatorClassname;
    let tooltipTitle;
    if (!sync) {
      indicatorClassname = 'sync-disabled';
      tooltipTitle = 'Synchronization with server is disabled in offline mode.';
    } else if (syncInProgress) {
      indicatorClassname = 'sync-in-progress';
      tooltipTitle = 'Synchronization with server is in progress...';
    } else if (requestFailed) {
      indicatorClassname = 'request-failed';
      tooltipTitle = 'Synchronization with server failed, waiting until retrying...';
    } else {
      indicatorClassname = 'sync-ok';
      tooltipTitle = 'Synchronization with server is OK.';
    }

    const syncIndicatorBody = (
      <Tooltip
        placement="left"
        title={tooltipTitle}
      >
        <div
          className={indicatorClassname}
          id="sync-indicator"
        />
      </Tooltip>
    );

    return (
      <div
        style={{ zIndex: '1000', position: 'fixed', top: '0', right: '0' }}
        id="sync-indicator-wrapper"
      >
        {syncIndicatorBody}
      </div>
    );
  }
}

SyncIndicator.propTypes = propTypes;

export default SyncIndicator;
