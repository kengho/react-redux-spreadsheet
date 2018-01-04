import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MaterialDialog from 'material-ui/Dialog';
import React from 'react';

import './Dialog.css';
import * as RequestsActions from '../../actions/requests';
import * as SettingsActions from '../../actions/settings';
import * as TableActions from '../../actions/table';
import * as UiActions from '../../actions/ui';
import * as UndoRedoActions from '../../actions/undoRedo';
import DestroySpreadsheetDialog from './DestroySpreadsheetDialog';
import ImportDialog from './ImportDialog';
import InfoDialog from './InfoDialog';
import SettingsDialog from './SettingsDialog';

const mapStateToProps = (state) => ({
  disableYesButton: state.getIn(['ui', 'current', 'disableYesButton']),
  errors: state.getIn(['ui', 'current', 'errors']),
  settings: state.get('settings'),
  variant: state.getIn(['ui', 'current', 'variant']),

  // TODO: ui kind should be constant.
  visibility: (
    state.getIn(['ui', 'current', 'kind']) === 'DIALOG' &&
    state.getIn(['ui', 'current', 'visibility'])
  ),
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...RequestsActions, // requestsPush
      ...SettingsActions, // setSettingsParam
      ...TableActions, // setTableFromJSON
      ...UiActions,
      ...UndoRedoActions, // clearHistory
    }, dispatch),
  },
});

class Dialog extends React.Component {
  keyDownHandler(evt) {
    // Prevents firing documentKeyDownHandler().
    evt.nativeEvent.stopImmediatePropagation();
  }

  onClickHandler(evt) {
    // Prevents firing documentClickHandler().
    evt.nativeEvent.stopImmediatePropagation();
  }

  render() {
    // Extracting props.
    const {
      variant,
      visibility,
      ...other,
    } = this.props;

    // Non-extracting props (should be passed to children as well).
    const {
      actions, // uses in DestroySpreadsheetDialog, InfoDialog and ImportDialog
    } = this.props;

    // TODO: variants should be constants.
    // TODO: get correct dialog dynamically.
    let dialogBody;
    switch (variant) {
      case 'DESTROY_SPREADSHEET': {
        dialogBody = <DestroySpreadsheetDialog {...other} />
        break;
      }

      case 'INFO': {
        dialogBody = <InfoDialog {...other} />
        break;
      }

      case 'IMPORT': {
        dialogBody = <ImportDialog {...other} />
        break;
      }

      case 'SETTINGS': {
        dialogBody = <SettingsDialog {...other} />
        break;
      }

      default: {
        // Shouldn't happen; fill just in case.
        dialogBody = '';
      }
    }

    // TODO: focus Dialog buttons using hotkeys.
    //   This doesn't work (on Button):
    //   // style={{ keyboardFocused: (buttonMap.type === 'ACTION') }}
    //   'ref' on buttons also returns strange results.

    return (
      <MaterialDialog
        className="dialog"
        onClick={this.onClickHandler}
        onKeyDown={this.keyDownHandler}
        onBackdropClick={actions.closeUi}
        open={visibility}
      >
        {dialogBody}
      </MaterialDialog>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialog);
