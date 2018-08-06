import * as TableActions from '../../actions/table';
import * as UiActions from '../../actions/ui';
import {
  CELL,
  COLUMN,
  ROW,
} from '../../constants';
import { composeCellProps } from '../../lib/getCellProps';
import findKeyAction from '../../lib/findKeyAction';

export default function bodyKeyDownHandler(evt) {
  const {
    actions,
  } = this.props;

  const action = findKeyAction(evt, [
    {
      condition: () => (evt.key.length === 1 || evt.key === 'Enter' || evt.key === 'F2'),
      altKey: false,
      ctrlKey: false,
      action: () => {
        if (evt.key === 'Enter') {
          // Prevents immediately pressing Enter after focus (deletes selected text).
          evt.preventDefault();
        }

        const modifiers = { edit: true };
        if (evt.key !== 'F2') {
          modifiers.selectOnFocus = true;
        }

        // NOTE: 'input' renders after 'keydown', and symbols appears after 'keyup',
        //   therefore after `setState` input's value is already 'evt.key'.
        actions.setPointer(modifiers);
      },
    },
    {
      key: 'Tab',
      ctrlKey: false,
      action: () => {
        // Prevents losing focus.
        evt.preventDefault();

        const effectiveKey = evt.shiftKey ? 'ArrowLeft' : 'ArrowRight';
        actions.movePointer({ key: effectiveKey });
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
      ],
      action: () => {
        // Prevents native scrollbar movement.
        evt.preventDefault();

        // console.time('bodyKeyDownHandler arrowkeys');
        // REVIEW: can we just pass "evt" to movePointer?
        actions.movePointer({
          key: evt.key,
          altKey: evt.altKey,
          ctrlKey: evt.ctrlKey,
        });

        // NOTE: PERF: without selection check: ~250ms. With: ~100ms.
        // TODO: issue flows from SET_IN action being inefficient for objects,
        //   bacause setting object to state make Table to rerender even
        //   it's essentially the same.
        const selection = this.props.table.getIn(['session', 'selection', 0]);
        const thereIsSelection =
          selection.getIn(['boundary', ROW]) &&
          selection.getIn(['boundary', COLUMN]);
        if (thereIsSelection) {
          actions.clearSelection();
        }
        // console.timeEnd('bodyKeyDownHandler arrowkeys');
      },
    },
    {
      keys: ['Home', 'End'],
      action: () => evt.preventDefault(),
    },
    {
      keys: 'Delete',
      action: () => {
        actions.clearUserSpecifiedArea();
      },
    },
    {
      key: 'Backspace',
      action: () => {
        // Prevents going back in history via Backspace.
        evt.preventDefault();
        actions.deleteUserSpecifiedArea();
      },
    },
    {
      which: 67, // Ctrl+C
      action: () => {
        evt.preventDefault();
        actions.copyUserSpecifiedArea();
      },
    },
    {
      which: 88, // Ctrl+X
      action: () => {
        evt.preventDefault();
        actions.cutUserSpecifiedArea();
      },
    },
    // NOTE: see pasteHandler() in Table.
    // {
    //   which: 86, // Ctrl+V
    //   ctrlKey: true,
    //   action: () => {
    //     evt.preventDefault();
    //     actions.pasteUserSpecifiedArea();
    //   },
    // },
    {
      key: 'Escape',
      action: () => {
        // NOTE: if we don't clear clipboard here, after pressing Ctrl+C and Escape
        //   there is no way to set clipboard from other source (since app's clipboard
        //   is not empty). App's clipboard have priority over systems
        //   (see workOnUserSpecifiedArea()). The best UX would be watching system
        //   clipboard changes and clearing app's clipboard if there are any,
        //   but it seems too complicated and unsecure.
        // NOTE: PERF: without batchActions: ~275ms. With batchActions: ~100ms.
        // console.time('bodyKeyDownHandler Escape');
        // REVIEW: should we import actions one by one or TableActions and etc. is OK?
        actions.batchActions([
          TableActions.setClipboard({
            [ROW]: {
              index: null,
            },
            [COLUMN]: {
              index: null,
            },
            cells: null,
          }),
          UiActions.closeSearchBar(),
          TableActions.clearSelection(),
        ]);
        // console.timeEnd('bodyKeyDownHandler Escape');
      },
    },
    {
      which: 90, // Ctrl+Z
      ctrlKey: true,
      action: () => {
        if (this.props.canUndo) {
          actions.undo();
        }
      },
    },
    {
      which: 89, // Ctrl+Y
      ctrlKey: true,
      action: () => {
        if (this.props.canRedo) {
          actions.redo();
        }
      },
    },

    // test_752
    {
      key: 'ContextMenu',
      action: () => {
        const actions = this.props.actions;
        const cellPosition = this.props.table.getIn(['session', 'pointer']).toJS();

        actions.setMenu({
          place: CELL,
          ...composeCellProps(
            cellPosition,
            {
              [ROW]: {
                offset: 0,
              },
              [COLUMN]: {
                offset: 0,
              },
            },
          ),
        });
        actions.openPopup();
      },
    },
    {
      which: 70, // Ctrl+F
      ctrlKey: true,
      action: () => {
        evt.preventDefault();
        actions.closeSearchBar();
        actions.openSearchBar();
      },
    },
    // For dev.
    // {
    //   which: 76, // Ctrl+Shift+L
    //   ctrlKey: true,
    //   shiftKey: true,
    //   action: () => {
    //     evt.preventDefault();
    //   },
    // },
  ]);

  if (action) {
    action();
  }
}
