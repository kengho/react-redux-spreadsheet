import {
  DialogActions as MaterialDialogActions,
  DialogContent as MaterialDialogContent,
  DialogTitle as MaterialDialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemText } from 'material-ui/List';
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
  actions: PropTypes.object.isRequired,
};

class InfoDialog extends React.PureComponent {
  render() {
    const {
      actions,
    } = this.props;

    const hotkeysMap = [
      ['Ctrl+Z', 'undo'],
      ['Ctrl+Y', 'redo'],
      ['Ctrl+X', 'cut'],
      ['Ctrl+C', 'copy'],
      ['Ctrl+V', 'paste'],
      ['Enter / Shift+Enter', 'save and move cursor down/up'],
      ['Tab / Tab+Enter', 'save and move cursor to the right/left'],
      ['Escape or Backspace', 'delete cell\'s value'],
      ['Arrow keys, Home, End, PgUp, PgDn', 'move cursor'],
      ['Ctrl+Enter (while editing)', 'insert new line'],
    ];

    return ([
      <MaterialDialogTitle key="dialog-title">
        Help
      </MaterialDialogTitle>,
      <MaterialDialogContent key="dialog-content">
        <div className="info">
          <List>
            {hotkeysMap.map(hotkeyMap =>
              <ListItem key={hotkeyMap[0]}>
                <ListItemText
                  primary={hotkeyMap[0]}
                  secondary={hotkeyMap[1]}
                />
              </ListItem>
            )}
          </List>
        </div>
      </MaterialDialogContent>,
      <MaterialDialogActions key="dialog-actions" className="dialog-buttons">
        <Button
          onClick={() => actions.uiClose()}
        >
          OK
        </Button>
      </MaterialDialogActions>,
    ]);
  }
}

InfoDialog.propTypes = propTypes;

export default InfoDialog;
