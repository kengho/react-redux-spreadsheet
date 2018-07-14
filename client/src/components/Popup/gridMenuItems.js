import FileSaver from 'file-saver';

import { convert } from '../../core';
import {
  CSV,
  DESTROY_SPREADSHEET,
  IMPORT,
  INFO,
  JSON_FORMAT,
  SETTINGS,
} from '../../constants';
import datetime from '../../lib/datetime';

export default function gridMenuItems(props) {
  const {
    actions,
    server,
  } = props;

  const exportTo = async (outputFormat) => {
    const {
      settings,
      shortId,
      table,
    } = props;

    const formattedDate = datetime({
      date: new Date(),
      format: {
        timeDelim: '-',
        datetimeDelim: '_',
      },
    });
    const convertedData = await convert({
      table,
      settings,
      outputFormat,
    });

    const blob = new Blob([convertedData], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `${formattedDate}_${shortId}.${outputFormat.toLowerCase()}`);
  };

  // TODO: use some progress for import (see ImportDialog for example).
  return [
    {
      label: 'Export to CSV',
      action: () => exportTo(CSV),
    },
    {
      label: 'Export to JSON',
      action: () => exportTo(JSON_FORMAT),
    },
    {
      label: 'Import...',
      action: () => actions.openDialog(IMPORT),
    },
    {
      label: 'Settings...',
      action: () => actions.openDialog(SETTINGS),
    },
    {
      label: 'Help...',
      action: () => actions.openDialog(INFO),
    },
    {
      label: 'Undo',
      action: () => actions.undo(),
      disabled: (props) => !props.canUndo,
    },
    {
      label: 'Redo',
      action: () => actions.redo(),
      disabled: (props) => !props.canRedo,
    },
    ...(server.get('sync') ? [
      {
        label: 'Destroy...',
        action: () => actions.openDialog(DESTROY_SPREADSHEET),
      }
    ] : []),
  ];
}
