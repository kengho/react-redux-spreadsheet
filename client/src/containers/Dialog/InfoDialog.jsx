import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
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
      <DialogTitle>
        Help
      </DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus={true}
          onClick={() => actions.closeDialog()}
        >
          OK
        </Button>
      </DialogActions>
    </React.Fragment>
  );
};

InfoDialog.propTypes = propTypes;

export default InfoDialog;
