import {
  DialogActions as MaterialDialogActions,
  DialogContent as MaterialDialogContent,
  DialogTitle as MaterialDialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import React from 'react';

import { DESTROY_SPREADSHEET } from '../../constants';
import withCircularProgress from './withCircularProgress';

const propTypes = {
  actions: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
};

class DestroySpreadsheetDialog extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isProcessing: false,
    };
  }

  render() {
    const {
      actions,
      server,
    } = this.props;
    const requestFailed = server.get('requestFailed');
    const isProcessing = this.state.isProcessing;

    return (
      <React.Fragment>
        <MaterialDialogTitle>
          Confirm action
        </MaterialDialogTitle>
        <MaterialDialogContent>
          Are you sure you want to destroy spreadsheet?<br />
          This action cannot be undone.
          {requestFailed &&
            <div className="dialog-messages">
              Sorry, unable to destroy spreadsheet, please try later.
            </div>
          }
        </MaterialDialogContent>
        <MaterialDialogActions className="dialog-buttons">
          <Button
            onClick={() => {
              actions.closeDialog();
              actions.setRequestFailed(false); // destroy action don't repeating in handleSyncRequest
            }}
          >
            Go back
          </Button>
          {withCircularProgress(
            <Button
              variant="raised"
              color="secondary"
              disabled={requestFailed || isProcessing}
              onClick={
                () => {
                  actions.makeServerRequest(DESTROY_SPREADSHEET);
                  this.setState({ isProcessing: true });
                }
              }
            >
              Yes, I'm sure
            </Button>,
            isProcessing
          )}
        </MaterialDialogActions>
      </React.Fragment>
    );
  }
}

DestroySpreadsheetDialog.propTypes = propTypes;

export default DestroySpreadsheetDialog;
