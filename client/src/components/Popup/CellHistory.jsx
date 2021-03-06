import Popover from '@material-ui/core/Popover';
import PropTypes from 'prop-types';
import React from 'react';

import './CellHistory.css';
import {
  COLUMN,
  HISTORY,
  ROW,
} from '../../constants';
import CellHistoryRecords from './CellHistoryRecords';
import findKeyAction from '../../lib/findKeyAction';
import Popup from './Popup';

const propTypes = {
  table: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
};

class CellHistory extends React.PureComponent {
  // REVIEW: PERF: should CellHistory have shouldComponentUpdate?
  // shouldComponentUpdate(nextProps, nextState) {
  // }

  keyDownHandler = (evt) => {
    // Prevents firing body's keyDownHandler().
    evt.nativeEvent.stopImmediatePropagation();

    const action = findKeyAction(evt, [
      {
        // TODO: create custom Tab key handler. The issue with default one is
        //   that focus isn't limited by that component, and focus goes to
        //   Table and etc. Tabindexes are already there.
        key: 'Tab',
        action: () => {
          evt.preventDefault();
        },
      },

      // NOTE: allow Ctrl+C and etc., exit only by Escape.
      {
        key: 'Escape',
        action: () => {
          this.props.actions.closePopup();
        },
      },
    ]);

    if (action) {
      action();
    }
  }

  render() {
    const {
      actions,
      table,
      ui,
    } = this.props;

    const popup = ui.popup;
    const open = popup.visibility && (popup.kind === HISTORY);

    const rowIndex = popup.cellProps[ROW].index;
    const columnIndex = popup.cellProps[COLUMN].index;
    const popupAnchorSelector = `[data-row-index="${rowIndex}"][data-column-index="${columnIndex}"]`;

    let cell;
    try {
      cell = table.layout[ROW].list[rowIndex].cells[columnIndex] || {};
    } catch (e) {
      cell = {};
    }
    const history = cell.history;
    const value = cell.value || '';

    return (
      <Popup
        className="cell-history"
        kind={HISTORY}
        offsetX={popup.cellProps[COLUMN].offset}
        offsetY={popup.cellProps[ROW].offset}
        onClose={actions.closePopup}
        onKeyDown={this.keyDownHandler}
        open={open}
        overrideShouldComponentUpdate={true}
        PopoverComponent={Popover}
        popupAnchorSelector={popupAnchorSelector}
      >
        <CellHistoryRecords
          actions={actions}
          history={history}
          popup={popup /* for delete history button (should close Popup at the end) */}
          value={value /* to disable corresponding restore button */}
        />
      </Popup>
    );
  }
}

CellHistory.propTypes = propTypes;

export default CellHistory;
