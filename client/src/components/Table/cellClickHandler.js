import {
  CELL,
  CELL_AREA,
  COLUMN,
  ROW,
  BEGIN,
  END,
  MENU,
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
    actions.setSearchBarFocus(false);
  }

  // REVIEW: PERF: capturing mouseover event here even without
  //   selection could cause problems, probably need to profile.
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
  const cellProps = composeCellProps(cellOffsets, cellSize, cellPosition);

  const pointer = table.session.pointer;
  const isCellPointed = (
    (cellPosition[ROW].index === pointer[ROW].index) &&
    (cellPosition[COLUMN].index === pointer[COLUMN].index)
  );
  const isCellEditing = isCellPointed && (pointer.edit === true);

  // Selection.
  // TODO: add ability to select several boundaries with ctrl.
  // test_465
  // test_205
  if (!isCellEditing) {
    if (!currentSelectionVisibility && (evt.type === 'mousedown') && (evt.button === LEFT_BUTTON)) {
      actionsToBatch.push(
        TableActions.clearSelection(),
        TableActions.setCurrentSelectionAnchor({
          selectionAnchorType: BEGIN,
          anchor: cellProps,
        }),
        TableActions.setCurrentSelectionAnchor({
          selectionAnchorType: END,
          anchor: cellProps,
        }),
        TableActions.setCurrentSelectionVisibility(true),
      );
    } else if (currentSelectionVisibility && (evt.type === 'mouseover') && (evt.button === LEFT_BUTTON)) {
      // TODO: scroll screen if mouse reaches border.
      actionsToBatch.push(
        TableActions.setCurrentSelectionAnchor({
          selectionAnchorType: END,
          anchor: cellProps,
        }),

        // test_816
        // NOTE: PERF: because it doesn't change state most of the time,
        //   Table don't rerender and performance doesn't degrade.
        TableActions.setPointerProps({
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

    const firstSelectionBoundary = table.session.selection[0].boundary;
    const { isInBoundary: isInSelection } = getBoundaryProps(firstSelectionBoundary, cellPosition);

    if (isInSelection) {
      // test_6999
      actionsToBatch.push(
        UiActions.setPopupPlace(CELL_AREA),
        UiActions.setPopupCellProps(cellProps),
        UiActions.openPopup(MENU),
      );
    } else {
      // test_2731
      actionsToBatch.push(
        UiActions.setPopupPlace(CELL),
        UiActions.setPopupCellProps(cellProps),
        UiActions.openPopup(MENU),

        // TODO: don't set pointer if there is selection (when there is code for selection).
        TableActions.setPointerProps({
          edit: false,
          selectOnFocus: false,
        }),
        TableActions.setPointerPosition(cellPosition),
      );
    }

  // NOTE: we catch "mousedown" instead of "click" for faster UI response.
  //   Ditching regular click just not to fire this action twice.
  // TODO: break this apart somehow, it's hard to read.
  } else if ((['dblclick', 'mousedown'].includes(evt.type)) && evt.button === LEFT_BUTTON) {
    const userWantsToEditCell = (evt.type === 'dblclick');
    const userWantsToPointCell = (evt.type === 'mousedown');

    if (!isCellPointed && evt.shiftKey) {
      // Create selection with shift+click.
      // test_772
      // REVIEW: maybe create separate action for this?
      actionsToBatch.push(
        TableActions.setCurrentSelectionVisibility(false),
        TableActions.setCurrentSelectionAnchor({
          selectionAnchorType: BEGIN,
          anchor: pointer,
        }),
        TableActions.setCurrentSelectionAnchor({
          selectionAnchorType: END,
          anchor: cellProps,
        }),
        TableActions.fixateCurrentSelection(),
      );
    } else {
      if (
        !(userWantsToPointCell && isCellPointed) &&
        !(userWantsToEditCell && isCellEditing)
      ) {
        actionsToBatch.push(
          TableActions.setPointerProps({
            edit: userWantsToEditCell,
            selectOnFocus: false,
          }),
          TableActions.setPointerPosition(cellPosition),
        );
      }
    }
  }

  if (actionsToBatch.length > 0) {
    actions.batchActions(actionsToBatch);
  }
  // console.timeEnd('cellClickHandler');
}
