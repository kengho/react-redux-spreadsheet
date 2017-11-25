import {
  DialogActions as MaterialDialogActions,
  DialogContent as MaterialDialogContent,
  DialogTitle as MaterialDialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
  actions: PropTypes.object.isRequired,
};

class DestroySpreadsheetDialog extends React.PureComponent {
  render() {
    const {
      actions,
    } = this.props;

    return ([
      <MaterialDialogTitle key="dialog-title">
        Confirm action
      </MaterialDialogTitle>,
      <MaterialDialogContent key="dialog-content">
        Are you sure?
      </MaterialDialogContent>,
      <MaterialDialogActions key="dialog-actions" className="dialog-buttons">
        <Button
          key="dialog-button-no"
          onClick={() => actions.closeUi()}
        >
          No, go back
        </Button>
        <Button
          key="dialog-button-yes"
          onClick={
            () => {
              actions.requestsPush('DELETE', 'destroy');
              actions.clearHistory();
              actions.closeUi();
            }
          }
        >
          Yes
        </Button>
      </MaterialDialogActions>,
    ]);
  }
}

DestroySpreadsheetDialog.propTypes = propTypes;

export default DestroySpreadsheetDialog;
