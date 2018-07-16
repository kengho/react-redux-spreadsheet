import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import React from 'react';
import SyncDisabled from '@material-ui/icons/SyncDisabled';
import SyncProblem from '@material-ui/icons/SyncProblem';
import Tooltip from '@material-ui/core/Tooltip';

import './SyncIndicator.css';

const propTypes = {
  server: PropTypes.object.isRequired
};

class SyncIndicator extends React.PureComponent {
  render() {
    const server = this.props.server;

    let syncIndicatorBody;
    if (!server.get('sync')) {
      // TODO: go online on click (if not offline).
      syncIndicatorBody = (
        <Tooltip
          placement="left"
          title="Synchronization with server is disabled."
        >
          <div>
            <IconButton disabled>
              <SyncDisabled />
            </IconButton>
          </div>
        </Tooltip>
      );
    } else if (!server.get('requestFailed')) {
      syncIndicatorBody = '';
    } else {
      syncIndicatorBody = (
        <Tooltip
          placement="left"
          title="Synchronization with server is in progress..."
        >
          {/* NOTE: without div tooltip not showing. */}
          {/*   https://github.com/mui-org/material-ui/issues/8416#issuecomment-332556082 */}
          <div>
            <IconButton disabled>
              <SyncProblem />
            </IconButton>
          </div>
        </Tooltip>
      );
    }

    return (
      <Paper
        style={{ zIndex: '1000', position: 'fixed', top: '0', right: '0' }}
        className="sync-indicator-wrapper"
      >
        {syncIndicatorBody}
      </Paper>
    );
  }
}

SyncIndicator.propTypes = propTypes;

export default SyncIndicator;
