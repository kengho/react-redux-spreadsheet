import {
  DialogActions as MaterialDialogActions,
  DialogContent as MaterialDialogContent,
  DialogTitle as MaterialDialogTitle,
} from 'material-ui/Dialog';
import { List } from 'immutable';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import React from 'react';

import { convert } from '../../core';

const propTypes = {
  actions: PropTypes.object.isRequired,
  disableYesButton: PropTypes.bool.isRequired,
  errors: PropTypes.object,
};

const defaultProps = {
  errors: List(),
};

class ImportFromCSVDialog extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleCSVFileImport = this.handleCSVFileImport.bind(this);

    this.importAction = null;
  }

  handleCSVFileImport(evt) {
    // TODO: drag-and-drop.
    const input = evt.target;
    const reader = new FileReader();

    reader.onload = (file) => {
      const csv = reader.result;
      const tableData = convert(csv, { inputFormat: 'csv', outputFormat: 'object' });

      const fileName = input.files[0].name
      this.fileFakeInput.value = fileName;
      this.fileFakeInput.title = fileName;

      this.importAction = () => {
        this.props.actions.tableSetFromJSON(
          JSON.stringify({ data: tableData.data }), true
        );
      };

      this.props.actions.uiOpen('DIALOG', {
        disableYesButton: false,
        errors: tableData.errors,
        variant: 'IMPORT_FROM_CSV',
      });

      // Fixind error
      // "Failed to execute 'readAsText' on 'FileReader': parameter 1 is not of type 'Blob'."
      input.value = null;
    };

    reader.readAsText(input.files[0]);
  }

  render() {
    const {
      actions,
      disableYesButton,
      errors,
    } = this.props;

    return ([
      <MaterialDialogTitle key="dialog-title">
        Select CSV file
      </MaterialDialogTitle>,
      <MaterialDialogContent key="dialog-content">
        <div className="dialog-import">
          <input
            accept="csv,CSV"
            id="file"
            onChange={this.handleCSVFileImport}
            type="file"
          />
          <label htmlFor="file">
            <Button
              color="primary"
              raised
              component="span"
            >
              Choose file
            </Button>
          </label>
          <input
            className="fake-input"
            disabled
            ref={(c) => { this.fileFakeInput = c; }}
          />
        </div>
        <ul className="dialog-errors">
          {errors.map((error) =>
            <li key={error.get('code')}>
              {error.get('message')}
            </li>
          )}
        </ul>
      </MaterialDialogContent>,
      <MaterialDialogActions key="dialog-actions" className="dialog-buttons">
        <Button
          key="dialog-button-no"
          onClick={
            () => {
              actions.uiClose();
              this.fileFakeInput.value = '';
            }
          }
        >
          Cancel
        </Button>
        <Button
          key="dialog-button-yes"
          disabled={disableYesButton}
          onClick={
            () => {
              // NOTE: importAction should be not null if we press yes button,
              //   because otherwise yes button would be inactive.
              //   See handleCSVFileImport().
              this.importAction();
              actions.uiClose();
            }
          }
        >
          Import
        </Button>
      </MaterialDialogActions>,
    ]);
  }
}

ImportFromCSVDialog.propTypes = propTypes;
ImportFromCSVDialog.defaultProps = defaultProps;

export default ImportFromCSVDialog;
