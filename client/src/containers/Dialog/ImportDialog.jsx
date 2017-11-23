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

class ImportDialog extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleFileImport = this.handleFileImport.bind(this);

    // Just in case.
    this.importAction = () => {};
  }

  handleFileImport(evt) {
    // TODO: drag-and-drop.
    const input = evt.target;
    const reader = new FileReader();

    reader.onload = (file) => {
      const filename = input.files[0].name
      this.fileFakeInput.value = filename;
      this.fileFakeInput.title = filename;

      // TODO: unsupported format excepton.
      const extention = filename.split('.').pop();

      // TODO: extention => format mapping.
      const fileContent = reader.result;
      const tableData = convert(fileContent, { inputFormat: extention, outputFormat: 'object' });

      // TODO: DRY.
      switch (extention) {
        case 'csv': {
          this.importAction = () => {
            this.props.actions.setTableFromJSON(
              JSON.stringify({ data: tableData.data }), true
            );
          };

          this.props.actions.openUi('DIALOG', {
            disableYesButton: false,
            errors: tableData.errors,
            variant: 'IMPORT',
          });

          break;
        }

        case 'json': {
          if (tableData.errors) {
            this.props.actions.openUi('DIALOG', {
              disableYesButton: true,
              errors: tableData.errors,
              variant: 'IMPORT',
            });
          } else {
            this.importAction = () => {
              this.props.actions.setTableFromJSON(
                JSON.stringify({ data: tableData.data }), true
              );
            };

            this.props.actions.openUi('DIALOG', {
              disableYesButton: false,
              errors: tableData.errors,
              variant: 'IMPORT',
            });
          }

          break;
        }

        default:
      }

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

    // TODO: describe json format.
    return ([
      <MaterialDialogTitle key="dialog-title">
        Select file (CSV, JSON)
      </MaterialDialogTitle>,
      <MaterialDialogContent key="dialog-content">
        <div className="dialog-import">
          <input
            accept="csv,CSV,json,JSON"
            id="file"
            onChange={this.handleFileImport}
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
              actions.closeUi();
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
              //   See handleFileImport().
              this.importAction();
              actions.closeUi();
            }
          }
        >
          Import
        </Button>
      </MaterialDialogActions>,
    ]);
  }
}

ImportDialog.propTypes = propTypes;
ImportDialog.defaultProps = defaultProps;

export default ImportDialog;
