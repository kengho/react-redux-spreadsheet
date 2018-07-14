import {
  COLUMN,
  ROW,
} from '../../constants';

export default function cellAreaMenuItems(props) {
  const {
    actions,
    ui,
  } = props;
  const popup = ui.get('popup');

  return [
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
