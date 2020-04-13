import DeleteAllIcon from '@material-ui/icons/DeleteSweep';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import RestoreIcon from '@material-ui/icons/Restore';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';

import datetime from '../../lib/datetime';
import rippleButtonAction from '../../lib/rippleButtonAction';

const propTypes = {
  actions: PropTypes.object.isRequired,
  history: PropTypes.array,
  popup: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
};

const defaultProps = {
  history: [],
};

class CellHistoryRecords extends React.PureComponent {
  deleteRecordButtonHandler = (historyIndex) => {
    return rippleButtonAction(() => {
      this.props.actions.deleteCellHistory(this.props.popup.cellProps, historyIndex);
    });
  };

  deleteAllRecordsButtonHandler = () => {
    return rippleButtonAction(() => {
      this.props.actions.deleteCellHistory(this.props.popup.cellProps);
    });
  };

  restoreRecordButtonHandler = (historyValue) => {
    return rippleButtonAction(() => {
      this.props.actions.setProp({...this.props.popup.cellProps, prop: 'value', value: historyValue });
    });
  };

  render() {
    const {
      history,
      value,
    } = this.props;

    if (history.length === 0) {
      return <div id="cell-history-no-records">No records.</div>;
    } else {
      return (
        <Table className="cell-history">
          <TableHead>
            <TableRow>
              <TableCell>
                <Tooltip title="Forget all">
                  <IconButton
                    onClick={this.deleteAllRecordsButtonHandler()}
                    tabIndex="1"
                  >
                    <DeleteAllIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell>Restore</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Added at</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((entry, historyIndex) => {
              const time = entry.time;
              const formattedDatetime = datetime({
                date: new Date(time),
                format: {
                  timeDelim: ':',
                  datetimeDelim: ' ',
                },
              });
              const historyValue = entry.value || '';

              return (
                <TableRow
                  key={`cell-history-record-${time}-${historyValue}`}
                  hover={true}
                >
                  <TableCell>
                    <IconButton
                      onClick={this.deleteRecordButtonHandler(historyIndex)}
                      tabIndex={1 + 2*historyIndex + 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      disabled={historyValue === value}
                      onClick={this.restoreRecordButtonHandler(historyValue)}
                      tabIndex={1 + 2*historyIndex + 2}
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
