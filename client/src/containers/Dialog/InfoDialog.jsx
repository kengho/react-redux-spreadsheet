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

const InfoDialog = (props) => {
  const actions = props.actions;

  const hotkeysMap = [
    ['Ctrl+Z', 'undo'],
    ['Ctrl+Y', 'redo'],
    ['Ctrl+X', 'cut (works on selection)'],
    ['Ctrl+C', 'copy (works on selection)'],
    ['Ctrl+V', 'paste (works on selection)'],
    ['Enter / Shift+Enter', 'save and move cursor down/up'],
    ['Tab / Shift+Tab', 'save and move cursor to the right/left'],
    ['Escape or Backspace', 'delete cell\'s value'],
    ['Arrow keys', 'move cursor'],
    ['Arrow keys with Ctrl', 'move cursor to the nearest nonempty cell'],
    ['PgUp, PgDn', 'move cursor fast up and down'],
    ['PgUp, PgDn with Alt', 'move cursor fast to the left and right '],
    ['Ctrl+Enter (while editing)', 'insert new line'],
    ['Right-click', 'show context menu'],
  ];

  return (
    <React.Fragment>
      <MaterialDialogTitle>
        Help
      </MaterialDialogTitle>
      <MaterialDialogContent>
        <List dense={true}>
          {hotkeysMap.map((hotkeyMap) =>
            <ListItem key={hotkeyMap[0]}>
              <ListItemText
                primary={hotkeyMap[0]}
                secondary={hotkeyMap[1]}
              />
            </ListItem>
          )}
        </List>
      </MaterialDialogContent>
      <MaterialDialogActions>
        <Button
          autoFocus={true}
          onClick={() => actions.closeDialog()}
        >
          OK
        </Button>
      </MaterialDialogActions>
    </React.Fragment>
  );
};

InfoDialog.propTypes = propTypes;

export default InfoDialog;
