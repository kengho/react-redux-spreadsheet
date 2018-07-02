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
  const popup = ui.get('popup');

  return [
    {
      label: 'View history...',
      opensAnotherPopup: true,
      action: () => {
        // NOTE: popup offsets stays the same, so CellHistory
        //   appears in the same place as Menu.
        actions.closePopup();
        actions.setPopupKind(HISTORY);
        actions.openPopup();
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
        index: popup.getIn([ROW, 'index']),
        number: 1,
      }),
    },
    {
      label: 'Insert row below',
      action: () => actions.insertLines({
        lineType: ROW,
        index: popup.getIn([ROW, 'index']) + 1,
        number: 1,
      }),
    },
    {
      label: 'Delete row',
      action: () => actions.deleteLines({
        lineType: ROW,
        index: popup.getIn([ROW, 'index']),
        number: 1,
      }),
    },
    {
      label: 'Insert column at left',
      action: () => actions.insertLines({
        lineType: COLUMN,
        index: popup.getIn([COLUMN, 'index']),
        number: 1,
      }),
    },
    {
      label: 'Insert column at right',
      action: () => actions.insertLines({
        lineType: COLUMN,
        index: popup.getIn([COLUMN, 'index']) + 1,
        number: 1,
      }),
    },
    {
      label: 'Delete column',
      action: () => actions.deleteLines({
        lineType: COLUMN,
        index: popup.getIn([COLUMN, 'index']),
        number: 1,
      }),
    },
    {
      label: 'Copy',
      action: () => actions.copyAtPointer(),
    },
    {
      label: 'Cut',
      action: () => actions.cutAtPointer(),
    },
    {
      label: 'Paste',
      action: () => actions.pasteAtPointer(),
    },
    {
      label: 'Clear',
      action: () => actions.clearAtPointer(),
    },
    // TODO: add confirmation dialog and proceed,
    // {
    //   label: 'Delete...',
    //   action: () => actions.deleteAtPointer(),
    // },
  ];
};
