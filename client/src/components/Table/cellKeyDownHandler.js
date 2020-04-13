import { ROW, COLUMN } from '../../constants';
import * as TableActions from '../../actions/table';
import findKeyAction from '../../lib/findKeyAction';

// TODO: use one export style for entire codebase.
export default function cellKeyDownHandler({ evt }) {
  // TODO: for some reason, pressing ContextMenu doesn't open browser
  //   context menu, though it's not catched here.

  // Preventing passing Ctlr+X to the body.
  evt.stopImmediatePropagation();

  const actions = this.props.actions;
  const pointer = this.props.table.session.pointer;

  const action = findKeyAction(evt, [
    {
      keys: ['Enter', 'Tab'],
      ctrlKey: false,
      action: () => {
        // Prevents inserting <br>.
        evt.preventDefault();

        let effectiveKey;
        switch (evt.key) {
          case 'Enter':
            effectiveKey = evt.shiftKey ? 'ArrowUp' : 'ArrowDown';
            break;

          case 'Tab':
            effectiveKey = evt.shiftKey ? 'ArrowLeft' : 'ArrowRight';
            break;

          default:
        }

        // NOTE: PERF: without batchActions: ~700ms. With batchActions: ~150ms.
        // console.time('cellKeyDownHandler Enter');
        // NOTE: actions should be batched until there are saveEditingCellValue middleware
        //   which works better with batched actions (there are many of them).
        actions.batchActions([
          TableActions.setPointer({ edit: false }),
          TableActions.movePointer({ key: effectiveKey }),
        ]);
        // console.timeEnd('cellKeyDownHandler Enter');
      },
    },
    {
      key: 'Enter',
      ctrlKey: true,
      shiftKey: false,
      action: () => {
        document.execCommand('insertText', false, '\n');
      },
    },
    {
      key: 'Escape',
      action: () => {
        // NOTE: PERF: without batchActions: ~140ms. With batchActions: ~100ms (insignificant).
        // console.time('cellKeyDownHandler Escape');
        const cellPosition = pointer;
        if (cellPosition) {
          let previousValue;
          try {
            previousValue = this.props.table
              .layout[ROW]
              .list[cellPosition[ROW].index]
              .cells[cellPosition[COLUMN].index]
              .value;
          } catch (e) {
            previousValue = '';
          }
          actions.setPointer({ value: previousValue });
        }
        actions.setPointer({ edit: false });
        // console.timeEnd('cellKeyDownHandler Escape');
      },
    },
    {
      keys: [
        'ArrowLeft',
        'ArrowRight',
      ],
      action: () => {
        // Prevent screen scrolling when caret can't move.

        // Don't hanle if there is text selection (arrow key don't move screen then).
        const selection = document.getSelection();
        if (selection.toString().length !== 0) {
          return;
        }

        // REVIEW: this max() construction.
        const caretUpperBoundary = Math.max(selection.focusOffset, selection.anchorOffset);
        const value = pointer.value;
        if (
          (evt.key === 'ArrowLeft' && caretUpperBoundary === 0) ||
          (evt.key === 'ArrowRight' && value.length === caretUpperBoundary)
        ) {
          evt.preventDefault();
        }
      },
    },
  ]);

  if (action) {
    action();
  }
}
