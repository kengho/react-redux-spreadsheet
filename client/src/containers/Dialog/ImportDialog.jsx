import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import React from 'react';

import { JSON_FORMAT, ConvertFormats } from '../../constants';
import withCircularProgress from '../../components/withCircularProgress';

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
          messages: ['Wrong file format.'],
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
      const dotFormat = '.' + format;
      return [dotFormat.toLowerCase(), dotFormat].join(',');
    }).join(',');

    // TODO: describe json format.
    return (
      <React.Fragment>
        <DialogTitle>
          Select file ({ConvertFormats.join(', ')})
        </DialogTitle>
        <DialogContent>
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
                variant="contained"
              >
                Choose file
              </Button>
            </label>
            <span className="filename" title={filename}>{filename}</span>
          </div>
          <ul className="dialog-messages">
            {messages.map((message) => <li key={message}>{message}</li>)}
          </ul>
        </DialogContent>
        <DialogActions className="dialog-buttons">
          <Button onClick={() => actions.closeDialog()}>Cancel</Button>
          {withCircularProgress(
            /* NOTE: autoFocus don't work. */
            <Button
              buttonRef={(c) => this.yesButton = c}
              color="primary"
              disabled={!Boolean(importedState)}
              variant="contained"
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
        </DialogActions>
      </React.Fragment>
    );
  }
}

ImportDialog.propTypes = propTypes;

export default ImportDialog;
