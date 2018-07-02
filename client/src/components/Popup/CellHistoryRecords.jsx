import DeleteIcon from 'material-ui-icons/Delete';
import IconButton from 'material-ui/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import RestoreIcon from 'material-ui-icons/Restore';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import datetime from '../../lib/datetime';
import rippleButtonAction from '../../lib/rippleButtonAction';

const propTypes = {
  actions: PropTypes.object.isRequired,
  history: PropTypes.object,
  popup: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
};

const defaultProps = {
  history: null,
};

class CellHistoryRecords extends React.PureComponent {
  deleteRecordButtonHandler = (historyIndex) => {
    return rippleButtonAction(() => {
      this.props.actions.deleteCellHistory(this.props.popup.toJS(), historyIndex);
    });
  }

  restoreRecordButtonHandler = (historyValue) => {
    return rippleButtonAction(() => {
      this.props.actions.setProp({...this.props.popup.toJS(), prop: 'value', value: historyValue });
    });
  }

  render() {
    const {
      history,
      value,
    } = this.props;

    // TODO: "forget all" button.
    // TODO: add option to not save history somewhere (spreadsheet settings?).
    //   Think about default value.
    if (!(history && history.size > 0)) {
      return <div className="cell-history-no-records">No records.</div>;
    } else {
      return (
        <Table className="cell-history">
          <TableHead>
            <TableRow>
              <TableCell>Forget</TableCell>
              <TableCell>Restore</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Added at</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((entry, historyIndex) => {
              const time = entry.get('time');
              const formattedDatetime = datetime({
                date: new Date(time),
                format: {
                  timeDelim: ':',
                  datetimeDelim: ' ',
                },
              });
              const historyValue = entry.get('value') || '';

              return (
                <TableRow
                  key={`cell-history-record-${time}-${historyValue}`}
                  hover={true}
                >
                  <TableCell>
                    <IconButton
                      onClick={this.deleteRecordButtonHandler(historyIndex)}
                      tabIndex={2 * historyIndex + 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      disabled={historyValue === value}
                      onClick={this.restoreRecordButtonHandler(historyValue)}
                      tabIndex={2 * historyIndex + 2}
                    >
                      <RestoreIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {historyValue}
                  </TableCell>
                  <TableCell>
                    {formattedDatetime}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      );
    }
  }
}

CellHistoryRecords.propTypes = propTypes;
CellHistoryRecords.defaultProps = defaultProps;

export default CellHistoryRecords;
