import {
  CELL,
  COLUMN,
  ROW,
} from '../../constants';
import {
  composeCellProps,
  getCellPosition,
} from '../../lib/getCellProps';
import findKeyAction from '../../lib/findKeyAction';

export default function bodyKeyDownHandler(evt) {
  const {
    actions,
    table,
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

        actions.movePointer({
          key: evt.key,
          altKey: evt.altKey,
        });
      },
    },
    {
      keys: ['Home', 'End'],
      action: () => evt.preventDefault(),
    },
    {
      keys: 'Delete',
      action: () => {
        actions.clearAtPointer();
      },
    },
    {
      key: 'Backspace',
      action: () => {
        // Prevents going back in history via Backspace.
        evt.preventDefault();
        actions.deleteAtPointer();
      },
    },
    {
      which: 67, // Ctrl+C
      action: () => {
        if (window.getSelection().toString().length > 0) {
          return;
        }

        evt.preventDefault();

        // TODO: don't hanlde if there are native selection.
        actions.copyAtPointer();
      },
    },
    {
      which: 88, // Ctrl+X
      action: () => {
        evt.preventDefault();
        actions.cutAtPointer();
      },
    },
    {
      which: 86, // Ctrl+V
      ctrlKey: true,
      action: () => {
        // TODO: paste from real clipboard.
        evt.preventDefault();
        actions.pasteAtPointer();
      },
    },
    {
      key: 'Escape',
      action: () => {
        // REVIEW: should Escape clear cells or just hide clipboard position?
        //   Now it mimics Calc behaviour (just hiding), making clipboarded
        //   cells still pastable. If this behaviour is "set in stone", appropriate
        //   action should be added instead of using plain setClipboard().
        const clipboard = table.getIn(['session', 'clipboard']);
        if (clipboard.get('cells')) {
          actions.setClipboard({
            [ROW]: {
              index: null,
            },
            [COLUMN]: {
              index: null,
            },
            cells: clipboard.get('cells').toJS(),
          });
        }

        actions.closeSearchBar();
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
    {
      key: 'ContextMenu',
      action: () => {
        const actions = this.props.actions;
        const cellPosition = getCellPosition({ elem: this.pointedCell });

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
