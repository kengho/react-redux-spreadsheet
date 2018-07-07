import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MaterialDialog from 'material-ui/Dialog';
import React from 'react';

import './Dialog.css';
import * as ServerActions from '../../actions/server';
import * as SettingsActions from '../../actions/settings';
import * as TableActions from '../../actions/table';
import * as UiActions from '../../actions/ui';
import * as UndoRedoActions from '../../actions/undoRedo';
import DestroySpreadsheetDialog from './DestroySpreadsheetDialog';
import ImportDialog from './ImportDialog';
import InfoDialog from './InfoDialog';
import SettingsDialog from './SettingsDialog';

import {
  DESTROY_SPREADSHEET,
  IMPORT,
  INFO,
  SETTINGS,
} from '../../constants';

const mapStateToProps = (state) => ({
  server: state.get('server'),
  settings: state.get('settings'),
  variant: state.getIn(['ui', 'dialog', 'variant']),
  visibility: state.getIn(['ui', 'dialog', 'visibility']) || false,
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...ServerActions, // makeServerRequest, setRequestFailed
      ...SettingsActions, // setSettings
      ...TableActions, // mergeServerState
      ...UiActions,
      ...UndoRedoActions, // clearHistory
    }, dispatch),
  },
});

class Dialog extends React.Component {
  keyDownHandler = (evt) => {
    evt.nativeEvent.stopImmediatePropagation();

    if (evt.key === 'Escape') {
      this.props.actions.closeDialog();
    }
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
      actions, // uses in DestroySpreadsheetDialog, ImportDialog and SettingsDialog
    } = this.props;

    let dialogBody = '';
    switch (variant) {
      case DESTROY_SPREADSHEET: {
        dialogBody = <DestroySpreadsheetDialog {...other} />
        break;
      }

      case IMPORT: {
        dialogBody = <ImportDialog {...other} />
        break;
      }

      case SETTINGS: {
        dialogBody = <SettingsDialog {...other} />
        break;
      }

      case INFO: {
        dialogBody = <InfoDialog {...other} />
        break;
      }

      default:
        break;
    }

    return (
      <MaterialDialog
        className="dialog"
        onBackdropClick={actions.closeDialog}
        onKeyDown={this.keyDownHandler}
        open={visibility}
      >
        {dialogBody}
      </MaterialDialog>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialog);
