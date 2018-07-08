import {
  COLUMN,
  ROW,
  ASCENDING,
  DESCENDING,
} from '../../constants';

export default function lineHeaderMenuItems(props) {
  const {
    actions,
    settings,
    ui,
  } = props;
  const popup = ui.get('popup');

  let lineType;
  if (Number.isInteger(ui.getIn(['popup', ROW, 'index']))) {
    lineType = ROW;
  } else {
    lineType = COLUMN;
  }

  if (lineType === ROW) {
    return [
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
    ];
  } else {
    return [
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
        label: 'Sort A to Z',
        action: () => actions.sort({
          lineType: COLUMN,
          index: popup.getIn([COLUMN, 'index']),
          order: ASCENDING,
          fixFirstLine: settings.get('tableHasHeader'),
        }),
      },
      {
        label: 'Sort Z to A',
        action: () => actions.sort({
          lineType: COLUMN,
          index: popup.getIn([COLUMN, 'index']),
          order: DESCENDING,
          fixFirstLine: settings.get('tableHasHeader'),
        }),
      },
      {
        label: 'Sort old to new',
        action: () => actions.sort({
          lineType: COLUMN,
          index: popup.getIn([COLUMN, 'index']),
          order: ASCENDING,
          propPath: ['history', 0, 'time'],
          fixFirstLine: settings.get('tableHasHeader'),
        }),
      },
      {
        label: 'Sort new to old',
        action: () => actions.sort({
          lineType: COLUMN,
          index: popup.getIn([COLUMN, 'index']),
          order: DESCENDING,
          propPath: ['history', 0, 'time'],
          fixFirstLine: settings.get('tableHasHeader'),
        }),
      },
    ];
  }
};
