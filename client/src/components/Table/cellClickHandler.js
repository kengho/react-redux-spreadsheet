import {
  CELL,
  CELL_AREA,
  COLUMN,
  ROW,
  BEGIN,
  END,
} from '../../constants';
import { getBoundaryProps } from '../../core';
import {
  composeCellProps,
  getCellOffsets,
  getCellPosition,
  getCellSize,
} from '../../lib/getCellProps';
import * as TableActions from '../../actions/table';
import * as UiActions from '../../actions/ui';
import getMousePosition from '../../lib/getMousePosition';

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

export default function cellClickHandler({ evt }) {
  const {
    actions,
    table,
    currentSelectionVisibility,
  } = this.props;

  if (evt.type === 'mousedown') {
    this.props.actions.setSearchBarFocus(false);
  }

  const cellPosition = getCellPosition({ evt });
  if (!cellPosition) {
    return;
  }

  // console.time('cellClickHandler');
  const actionsToBatch = [];

  const cellSelector =
    `[data-component-name="${CELL}"]` +
    `[data-row-index="${cellPosition[ROW].index}"]` +
    `[data-column-index="${cellPosition[COLUMN].index}"]`;
  const cell = document.querySelector(cellSelector);
  const cellOffsets = getCellOffsets(cell);
  const cellSize = getCellSize(cell);

  // NOTE: cellPosition here is required for fixateCurrentSelection().
  const cellPlacement = composeCellProps(cellOffsets, cellSize, cellPosition);

  const pointer = table.getIn(['session', 'pointer']);
  const cellIsPointed = (
    cellPosition[ROW].index === pointer.getIn([ROW, 'index']) &&
    cellPosition[COLUMN].index === pointer.getIn([COLUMN, 'index'])
  );
  const cellIsEditing = (cellIsPointed && pointer.get('edit') === true);

  // Selection.
  // TODO: add ability to select several boundaries with ctrl.
  // test_465
  // test_205
  if (!cellIsEditing) {
    if (!currentSelectionVisibility && (evt.type === 'mousedown') && (evt.button === LEFT_BUTTON)) {
      actionsToBatch.push(
        TableActions.clearSelection(),
        TableActions.setCurrentSelectionAnchor({
          selectionAnchorType: BEGIN,
          anchor: cellPlacement,
        }),
        TableActions.setCurrentSelectionAnchor({
          selectionAnchorType: END,
          anchor: cellPlacement,
        }),
        TableActions.setCurrentSelectionVisibility(true),
      );
    } else if (currentSelectionVisibility && (evt.type === 'mouseover') && (evt.button === LEFT_BUTTON)) {
      // TODO: scroll screen if mouse reaches border.
      actionsToBatch.push(
        TableActions.setCurrentSelectionAnchor({
          selectionAnchorType: END,
          anchor: cellPlacement,
        }),

        // test_816
        // NOTE: PERF: because it doesn't chang state most of the time,
        //   Table don't rerender and performance doesn't degrade.
        TableActions.setPointer({
          edit: false,
          selectOnFocus: false,
        }),
      );
    } else if (currentSelectionVisibility && (evt.type === 'mouseup') && (evt.button === LEFT_BUTTON)) {
      actionsToBatch.push(
        TableActions.fixateCurrentSelection(),
        TableActions.setCurrentSelectionVisibility(false),
      );
    }
  }

  // Clicks.
  // HACK: in Chrome "click" not fired when user rightclicks,
  //   so we just call menu not on click, but mousedown.
  //   Should probably catch calling context menu instead.
  if ((evt.type === 'mousedown') && (evt.button === RIGHT_BUTTON)) {
    const firstSelectionBoundary = table.getIn(['session', 'selection', 0, 'boundary']);
    const { isInBoundary: isInSelection} = getBoundaryProps(firstSelectionBoundary, cellPosition);

    const cellProps = composeCellProps(
      cellPosition,
      {
        [ROW]: {
          offset: getMousePosition(evt).page.y,
        },
        [COLUMN]: {
          offset: getMousePosition(evt).page.x,
        },
      },
    );

    if (isInSelection) {
      actionsToBatch.push(
        UiActions.setMenu({
          place: CELL_AREA,
          ...cellProps,
        }),
        UiActions.openPopup(),
      );
    } else {
      actionsToBatch.push(
        UiActions.setMenu({
          place: CELL,
          ...cellProps,
        }),
        UiActions.openPopup(),

        // TODO: don't set pointer if there are selection (when there is code for selection).
        TableActions.setPointer({
          ...cellPosition,
          ...{
            edit: false,
            selectOnFocus: false,
          },
        }),
      );
    }


  // Leftclick.
  // NOTE: we catch "mousedown" instead of "click" for faster UI response.
  //   Ditching regular click just not to fire this action twice.
  // TODO: break this apart somehow, it's hard to read.
  } else if ((['dblclick', 'mousedown'].includes(evt.type)) && evt.button === LEFT_BUTTON) {
    const pointer = table.getIn(['session', 'pointer']);

    const userWantsToEditCell = (evt.type === 'dblclick');
    const userWantsToPointCell = (evt.type === 'mousedown');
    const isCellPointed = (
      cellPosition[ROW].index === pointer.getIn([ROW, 'index']) &&
      cellPosition[COLUMN].index === pointer.getIn([COLUMN, 'index'])
    );
    const isCellEditing = (isCellPointed && pointer.get('edit') === true);

    if (!isCellPointed && evt.shiftKey) {
      // Create selection with shift+click.
      // test_772
      // REVIEW: maybe create separate action for this?
      actionsToBatch.push(
        TableActions.setCurrentSelectionVisibility(false),
        TableActions.setCurrentSelectionAnchor({
          selectionAnchorType: BEGIN,
          anchor: pointer.toJS(),
        }),
        TableActions.setCurrentSelectionAnchor({
          selectionAnchorType: END,
          anchor: cellPlacement,
        }),
        TableActions.fixateCurrentSelection(),
      );
    } else {
      if (
        !(userWantsToPointCell && isCellPointed) &&
        !(userWantsToEditCell && isCellEditing)
      ) {
        actionsToBatch.push(TableActions.setPointer({
          ...cellPosition,
          ...{
            edit: userWantsToEditCell,
            selectOnFocus: false,
          },
        }));
      }
    }
  }

  if (actionsToBatch.length > 0) {
    actions.batchActions(actionsToBatch);
  }
  // console.timeEnd('cellClickHandler');
}
