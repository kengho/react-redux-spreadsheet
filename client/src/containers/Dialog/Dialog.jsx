import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MaterialDialog from 'material-ui/Dialog';
import React from 'react';

import './Dialog.css';
import * as RequestsActions from '../../actions/requests';
import * as TableActions from '../../actions/table';
import * as UiActions from '../../actions/ui';
import DestroySpreadsheetDialog from './DestroySpreadsheetDialog';
import ImportFromCSVDialog from './ImportFromCSVDialog';
import InfoDialog from './InfoDialog';

const mapStateToProps = (state) => ({
  disableYesButton: state.getIn(['ui', 'current', 'disableYesButton']),
  errors: state.getIn(['ui', 'current', 'errors']),
  variant: state.getIn(['ui', 'current', 'variant']),
  visibility: (
    state.getIn(['ui', 'current', 'kind']) === 'DIALOG' &&
    state.getIn(['ui', 'current', 'visibility'])
  ),
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...RequestsActions, // requestsPush
      ...TableActions, // tableSetFromJSON
      ...UiActions,
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
      actions, // uses in DestroySpreadsheetDialog, InfoDialog and ImportFromCSVDialog
    } = this.props;

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

      case 'IMPORT_FROM_CSV': {
        dialogBody = <ImportFromCSVDialog {...other} />
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
        onRequestClose={actions.uiClose}
        open={visibility}
      >
        {dialogBody}
      </MaterialDialog>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialog);
