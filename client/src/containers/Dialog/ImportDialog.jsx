import {
  DialogActions as MaterialDialogActions,
  DialogContent as MaterialDialogContent,
  DialogTitle as MaterialDialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import React from 'react';

import { JSON_FORMAT, ConvertFormats } from '../../constants';
import withCircularProgress from './withCircularProgress';

const propTypes = {
  actions: PropTypes.object.isRequired,
};

class ImportDialog extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      filename: '',
      importedState: null,
      isProcessing: false,
      messages: [],
    };

    this.yesButton = null;
  }

  handleFileImport = async (evt) => {
    // TODO: drag-and-drop.
    const input = evt.target;
    const reader = new FileReader();

    reader.onload = async (file) => {
      const filename = input.files[0].name;

      this.setState({
        filename,
        isProcessing: true,
        messages: [],
      });

      const extention = filename.split('.').pop();
      const fileContent = reader.result;
      const inputFormat = extention.toUpperCase();
      if (ConvertFormats.includes(inputFormat)) {
        const { convert } = await import('../../core');
        const result = await convert({ serializedData: fileContent, inputFormat });

        // Can't continue if JSON parser fails.
        if (inputFormat === JSON_FORMAT && result.messages && result.messages.length > 0) {
          this.setState({
            messages: result.messages,
            isProcessing: false,
          });
        } else {
          this.setState({
            importedState: result.data,
            isProcessing: false,
          });

          if (this.yesButton && this.yesButton.focus) {
            this.yesButton.focus();
          }
        }
      } else {
        this.setState({
          messages: ['Wrong format file.'],
          isProcessing: false,
        });
      }
    };

    reader.readAsText(input.files[0]);
  }

  render() {
    const actions = this.props.actions;
    const {
      filename,
      importedState,
      isProcessing,
      messages,
    } = this.state;

    // ['CSV', 'JSON']
    // =>
    // csv,CSV,json,JSON
    const acceptedFormats = ConvertFormats.map((format) => {
      return [format.toLowerCase(), format].join(',');
    }).join(',');

    // TODO: describe json format.
    return (
      <React.Fragment>
        <MaterialDialogTitle>
          Select file ({ConvertFormats.join(', ')})
        </MaterialDialogTitle>
        <MaterialDialogContent>
          <div className="dialog-import">
            <input
              accept={acceptedFormats}
              id="file"
              onChange={this.handleFileImport}
              type="file"
            />
            <label htmlFor="file">
              <Button
                color="primary"
                component="span"
                variant="raised"
              >
                Choose file
              </Button>
            </label>
            <span className="filename" title={filename}>{filename}</span>
          </div>
          <ul className="dialog-messages">
            {messages.map((message) => <li key={message}>{message}</li>)}
          </ul>
        </MaterialDialogContent>
        <MaterialDialogActions className="dialog-buttons">
          <Button onClick={() => actions.closeDialog()}>Cancel</Button>
          {withCircularProgress(
            /* NOTE: autoFocus don't work. */
            <Button
              buttonRef={(c) => this.yesButton = c}
              color="primary"
              disabled={!Boolean(importedState)}
              variant="raised"
              onClick={
                () => {
                  actions.mergeServerState(importedState, true);
                  actions.closeDialog();
                }
              }
            >
              Import
            </Button>,
            isProcessing
          )}
        </MaterialDialogActions>
      </React.Fragment>
    );
  }
}

ImportDialog.propTypes = propTypes;

export default ImportDialog;
