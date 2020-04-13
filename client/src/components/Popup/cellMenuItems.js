import {
  COLUMN,
  HISTORY,
  ROW,
} from '../../constants';

export default function cellMenuItems(props) {
  const {
    actions,
    ui,
  } = props;
  const popup = ui.popup;

  return [
    {
      label: 'View history...',
      opensAnotherPopup: true,
      action: () => {
        // NOTE: popup offsets stays the same, so CellHistory
        //   appears in the same place as Menu.
        actions.closePopup();
        actions.openPopup(HISTORY);
      },

      // NOTE: there are no easy way to disable menu item
      //   because CellMenu doesn't know about entire table
      //   and we can't provede appropriate data fast enough.
      // disabled: ...
    },
    {
      label: 'Insert row above',
      action: () => actions.insertLines({
        lineType: ROW,
        index: popup.cellProps[ROW].index,
        number: 1,
      }),
    },
    {
      label: 'Insert row below',
      action: () => actions.insertLines({
        lineType: ROW,
        index: popup.cellProps[ROW].index + 1,
        number: 1,
      }),
    },
    {
      label: 'Delete row',
      action: () => actions.deleteLines({
        lineType: ROW,
        index: popup.cellProps[ROW].index,
        number: 1,
      }),
    },
    {
      label: 'Insert column at left',
      action: () => actions.insertLines({
        lineType: COLUMN,
        index: popup.cellProps[COLUMN].index,
        number: 1,
      }),
    },
    {
      label: 'Insert column at right',
      action: () => actions.insertLines({
        lineType: COLUMN,
        index: popup.cellProps[COLUMN].index + 1,
        number: 1,
      }),
    },
    {
      label: 'Delete column',
      action: () => actions.deleteLines({
        lineType: COLUMN,
        index: popup.cellProps[COLUMN].index,
        number: 1,
      }),
    },
    {
      label: 'Copy',
      action: () => actions.copyUserSpecifiedArea(),
    },
    {
      label: 'Cut',
      action: () => actions.cutUserSpecifiedArea(),
    },
    {
      label: 'Paste',
      action: () => actions.pasteUserSpecifiedArea(),
    },
    {
      label: 'Clear',
      action: () => actions.clearUserSpecifiedArea(),
    },
    // TODO: add confirmation dialog and proceed,
    // {
    //   label: 'Delete...',
    //   action: () => actions.deleteUserSpecifiedArea(),
    // },
  ];
}
