import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React from 'react';

import {
  getCellId,
  getColumnId,
  getRowId,
} from '../core';
import './Spreadsheet.css';
import * as LandingActions from '../actions/landing'; // landingSetMessages()
import * as MetaActions from '../actions/meta';
import * as RequestsActions from '../actions/requests';
import * as TableActions from '../actions/table';
import * as UiActions from '../actions/ui';
import * as UndoRedoActions from '../actions/undoRedo';
import cssToNumber from '../lib/cssToNumber';
import fetchServer from '../lib/fetchServer';
import findKeyAction from '../lib/findKeyAction';
import getRootPath from '../lib/getRootPath';
import isScrolledIntoView from '../lib/isScrolledIntoView';
import Row from '../components/Row';
import shiftScrollbar from '../lib/shiftScrollbar';
import TableMenu from '../components/TableMenu';

const mapStateToProps = (state) => {
  // FIXME: in tests table wraps into undoable twice
  //   because of environment condition in initialState().
  //   Cannot test Root render with non-empty data because if this.
  let table;
  if (process.env.NODE_ENV === 'test') {
    table = state.get('table').present.present;
  } else {
    table = state.get('table').present;
  }

  return {
    requests: state.get('requests'),
    table,
    ui: state.get('ui'),
    undo: {
      canRedo: state.get('table').future.length > 0,
      canUndo: state.get('table').past.length > 1, // omitting TABLE/SET_TABLE_FROM_JSON
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...LandingActions,
      ...MetaActions,
      ...RequestsActions,
      ...TableActions,
      ...UiActions,
      ...UndoRedoActions,
    }, dispatch),
  },
});

class Spreadsheet extends React.Component {
  constructor(props) {
    super(props);

    this.documentKeyDownHandler = this.documentKeyDownHandler.bind(this);
    this.documentClickHandler = this.documentClickHandler.bind(this);

    this.style = {
      borderSpacing: '2px',
    };
  }

  componentDidMount() {
    window.addEventListener('keydown', this.documentKeyDownHandler); // eslint-disable-line no-undef
    window.addEventListener('click', this.documentClickHandler); // eslint-disable-line no-undef

    // Don't fetch data from server in tests.
    if (process.env.NODE_ENV === 'test') {
      // FIXME: causes undo-redo-related problems.
      //   Need to totally review initialState().
      //
      // this.props.actions.metaSetShortId('1');
      //
      // const initialJSONTable = JSON.stringify(initialState(4, 4).get('table').present);
      // this.props.actions.tableSetFromJSON(initialJSONTable);

      return;
    }

    // Fetch data after initial render.
    if (this.props.table.getIn(['data', 'rows']).size === 0) {
      const shortId = this.props.match.params.shortId;
      fetchServer('GET', `show?short_id=${shortId}`)
        .then((json) => {
          if (json.errors) {
            const errors = json.errors.map((error) => error.detail);

            this.props.actions.landingSetMessages(errors);
            this.props.history.push(getRootPath());
          } else {
            // store's shortId used in handleRequestsChanges().
            this.props.actions.metaSetShortId(shortId);
            this.props.actions.tableSetFromJSON(json.data.table);
          }
        });
    }
  }

  componentWillUnmount() {
    // TODO: window or document?
    window.removeEventListener('keydown', this.documentKeyDownHandler); // eslint-disable-line no-undef
    window.removeEventListener('click', this.documentClickHandler); // eslint-disable-line no-undef
  }

  documentClickHandler(evt) {
    const actions = this.props.actions;

    // TODO: this is probably good to have some meta action,
    //   doing such similar things at once.
    actions.uiCloseAll(['menu', 'history']);
    actions.tableSetPointer({ cellId: null, modifiers: {} });
    actions.tableSetClipboard({ cells: {}, operation: null});
  }

  documentKeyDownHandler(evt) {
    const {
      actions,
      table,
    } = this.props;

    const action = findKeyAction(evt, [
      {
        condition: () => (evt.key.length === 1 || evt.key === 'Enter' || evt.key === 'F2'),
        altKey: false,
        ctrlKey: false,
        shiftKey: false,
        action: () => {
          if (evt.key === 'Enter') {
            // Prevents immediately pressing Enter after focus (deletes selected text).
            evt.preventDefault();
          }

          let modifiers = { edit: true };
          if (evt.key !== 'F2') {
            modifiers.selectOnFocus = true;
          }

          // 'input' renders after 'keydown', and symbols appears after 'keyup',
          // thus after `setState` input's value is already 'evt.key'.

          const pointer = table.getIn(['session', 'pointer']);
          let cellId = pointer.get('cellId');
          if (!cellId) {
            // Default pointer on [0, 0].
            cellId = getCellId(
              table.getIn(['data', 'rows', 0, 'id']),
              table.getIn(['data', 'columns', 0, 'id'])
            );
          }

          actions.tableSetPointer({ cellId, modifiers });
        },
      },
      {
        keys: [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'PageUp',
          'PageDown',
          'Home',
          'End',
        ],
        action: () => {
          // Prevents native scrollbar movement.
          evt.preventDefault();

          // REVIEW: 'querySelector' is probably not React-way.
          //   I could define 'this.previousPointer = this.table.session.pointer'
          //   in componentWillReceiveProps() and use it's cellId prop in getElementById,
          //   but I don't see how it is better than current implementation
          //   (also, it depends on id DataCell's id prop).
          //   Should page visibility params be part of the state?

          // Save previous pointed Cell's on-page visibility.
          const pointedCellBefore = document.querySelector('.pointed'); // eslint-disable-line no-undef

          let isScrolledIntoViewBefore;
          if (pointedCellBefore) {
            isScrolledIntoViewBefore = isScrolledIntoView(pointedCellBefore);
          } else {
            // Default value.
            isScrolledIntoViewBefore = { x: true, y: true };
          }

          // Perform pointer movement.
          actions.tableMovePointer(evt.key);

          // TODO: move this stuff to middleware, leave only tableMovePointer() here.
          // Figure out, should we move scrollbars to align with pointer movement.
          const pointedCellAfter = document.querySelector('.pointed'); // eslint-disable-line no-undef

          // pointedCellAfter is ought to exist.
          if (!pointedCellAfter) {
            return;
          }

          const isScrolledIntoViewAfter = isScrolledIntoView(pointedCellAfter);

          const rows = table.getIn(['data', 'rows']);
          const columns = table.getIn(['data', 'columns']);
          const pointedCellAfterPos = [
            rows.indexOf(getRowId(pointedCellAfter.id)),
            columns.indexOf(getColumnId(pointedCellAfter.id)),
          ];

          // TODO: in Chromium on 125 and 175% zoom correct value is 4.5 for some reason. Seems unfixable.
          if (
            (isScrolledIntoViewBefore.x && !isScrolledIntoViewAfter.x) ||
            (isScrolledIntoViewBefore.y && !isScrolledIntoViewAfter.y)
          ) {
            const borderSpacingNumber = cssToNumber(this.style.borderSpacing);
            shiftScrollbar(evt.key, pointedCellAfter, pointedCellAfterPos, borderSpacingNumber * 2);
          }
        },
      },
      {
        key: 'Escape',
        action: () => {
          actions.tableSetPointer({ cellId: null, modifiers: {} });
          actions.tableSetClipboard({ cells: {}, operation: null});

          // CellHistory doesn't have own keydown handler.
          actions.uiCloseAll('history');
        },
      },
      {
        keys: ['Delete', 'Backspace'],
        action: () => {
          const cells = table.getIn(['data', 'cells']);
          const pointerCellId = table.getIn(['session', 'pointer', 'cellId']);
          const pointedCellValue = cells.getIn([pointerCellId, 'value']);
          if (pointedCellValue) {
            // Prevents going back in history for Backspace.
            evt.preventDefault();

            actions.tableDeleteProp(pointerCellId, 'value');
          }
        },
      },
      {
        whichs: [67, 88], // 'Ctrl+C', 'Ctrl+X'
        ctrlKey: true,
        action: () => {
          // Prevents default action.
          evt.preventDefault();

          // NOTE: since we delete prop for Ctrl+X right here,
          //   we don't really need operation prop.
          let operation;
          if (evt.which === 67) { // 'c'
            operation = 'COPY';
          } else if (evt.which === 88) { // 'x'
            operation = 'CUT';
          }

          const clipboardCells = {};

          // TODO: handle many selected cells (also see store/middleware/handleClipboardChanges.js).
          const cells = table.getIn(['data', 'cells']);
          const pointerCellId = table.getIn(['session', 'pointer', 'cellId']);
          clipboardCells[pointerCellId] = cells.get(pointerCellId);

          if (operation === 'CUT') {
            actions.tableDeleteProp(pointerCellId, 'value');
          }

          actions.tableSetClipboard({
            cells: clipboardCells,
            operation,
          });
        },
      },
      {
        which: 86, // 'Ctrl+V'
        ctrlKey: true,
        action: () => {
          // Prevents native pasting into cell.
          evt.preventDefault();

          const clipboard = table.getIn(['session', 'clipboard']);

          // TODO: handle many selected cells.
          const srcCellsIds = clipboard.get('cells').keySeq();
          if (srcCellsIds.size !== 1) {
            return;
          }

          const srcCellId = srcCellsIds.get(0);
          const pointerCellId = table.getIn(['session', 'pointer', 'cellId']);
          const value = clipboard.getIn(['cells', srcCellId, 'value']) || '';

          // TODO: copy all props.
          actions.tableSetProp(pointerCellId, 'value', value);
        },
      },
      {
        which: 90, // 'Ctrl+Z'
        ctrlKey: true,
        action: () => {
          if (this.props.undo.canUndo) {
            actions.undo();
          }
        },
      },
      {
        which: 89, // 'Ctrl+Y'
        ctrlKey: true,
        action: () => {
          if (this.props.undo.canRedo) {
            actions.redo();
          }
        },
      },
      // For dev.
      // {
      //   which: 76, // 'Ctrl+Shift+L'
      //   ctrlKey: true,
      //   shiftKey: true,
      //   action: () => {
      //     evt.preventDefault();
      //     this.props.actions.uiSetDialogVisibility(true);
      //   },
      // },
    ]);

    action();
  }

  render() {
    const {
      actions,
      requests,
      table,
      ui,
      undo,
    } = this.props;
    const rows = table.getIn(['data', 'rows']);

    // TODO: draw some kind of spinner if table is empty.
    if (rows.size === 0) {
      return <div />;
    }

    // TODO: const props = {} ... // (see Row)
    const cells = table.getIn(['data', 'cells']);
    const clipboard = table.getIn(['session', 'clipboard']);
    const columns = table.getIn(['data', 'columns']);
    const hover = table.getIn(['session', 'hover']);
    const menusVisibility = ui.getIn(['visibility', 'menu']);
    const historiesVisibility = ui.getIn(['visibility', 'history']);
    const pointer = table.getIn(['session', 'pointer']);
    const updateTriggers = table.getIn(['updateTriggers']);

    const outputRows = [];
    for (let rowIndex = 0; rowIndex < rows.size; rowIndex += 1) {
      const rowId = rows.getIn([rowIndex, 'id']);

      outputRows.push(
        <Row
          actions={actions}
          cells={cells}
          clipboard={clipboard}
          columns={columns}
          hoverColumnId={rowIndex === 0 && getColumnId(hover)}
          key={rowId}
          menusVisibility={menusVisibility}
          historiesVisibility={historiesVisibility}
          pointer={pointer}
          rowId={rowId}
          rowNumber={rowIndex}
          rows={rows}
          rowUpdateTrigger={updateTriggers.getIn(['data', 'rows', rowId])}
        />
      );
    }

    // TODO: add optional header row without number.
    // TODO: show requests queue.
    // TODO: scroll to top/bottom buttons.
    // TODO: store pointer coordinates in URL and scroll to pointer on load.
    // TODO: create menu id getter.
    // TODO: add crop option to table menu.

    const thereIsClipboard = (clipboard.get('cells').size > 0);

    const firstCellId = getCellId(rows.getIn([0, 'id']), columns.getIn([0, 'id']));
    const nextMenuId = `${firstCellId}-column`;
    const previousMenuId = `${firstCellId}-row`;

    return (
      <div>
        <div
          className={`table ${thereIsClipboard? 'clipboard' : ''}`}
          onMouseLeave={() => { actions.tableSetHover(null); }}
          style={this.style}
        >
          <TableMenu
            actions={actions}
            data={this.props.table.get('data')}
            menuVisibility={menusVisibility.get('table')}
            nextMenuId={nextMenuId}
            previousMenuId={previousMenuId}
            requestsQueueLength={requests.get('queue').size}
            shortId={this.props.match.params.shortId}
            canUndo={undo.canUndo}
            canRedo={undo.canRedo}
          />
          {outputRows}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Spreadsheet);
