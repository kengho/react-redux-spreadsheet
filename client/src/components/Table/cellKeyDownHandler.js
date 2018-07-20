import { ROW, COLUMN } from '../../constants';
import * as TableActions from '../../actions/table';
import findKeyAction from '../../lib/findKeyAction';
import getCellProps, { getCellPosition } from '../../lib/getCellProps';

// TODO: use one export style for entire codebase.
export default function cellKeyDownHandler({ evt, elem }) {
  // TODO: for some reason, pressing ContextMenu doesn't open browser
  //   context menu, though it's not catched here.

  // Preventing passing Ctlr+X to the body.
  evt.stopImmediatePropagation();

  const actions = this.props.actions;
  const cell = evt.target.parentNode.parentNode;

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

        const cellProps = getCellProps(cell);
        if (!cellProps) {
          return;
        }

        // NOTE: PERF: without batchActions: ~700ms. With batchActions: ~150ms.
        // console.time('cellKeyDownHandler Enter');
        actions.batchActions([
          TableActions.insertRows(cellProps[ROW]),
          TableActions.insertColumns(cellProps[COLUMN]),
          TableActions.setPointer({
            edit: false,
            value: null,
          }),
          TableActions.movePointer({ key: effectiveKey }),

          // NOTE: see VERY IMPORTANT NOTE in configureStore().
          TableActions.setProp({
            ...cellProps,
            prop: 'value',
          }),
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
        const cellPosition = getCellPosition({ elem });
        if (cellPosition) {
          const previousValue = this.props.table.getIn(
            ['layout', ROW, 'list', cellPosition[ROW].index, 'cells', cellPosition[COLUMN].index, 'value'],
            ''
          );
          elem.innerHTML = previousValue;
        }
        actions.setPointer({ edit: false });
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
        const value = cell.innerText;
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
