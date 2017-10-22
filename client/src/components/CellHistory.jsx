import CloseIcon from 'material-ui-icons/Close';
import DeleteIcon from 'material-ui-icons/Delete';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React from 'react';
import RestoreIcon from 'material-ui-icons/Restore';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import './CellHistory.css';
import datetime from '../lib/datetime';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  cellValue: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

const defaultProps = {
};

class CellHistory extends React.PureComponent {
  constructor(props) {
    super(props);

    this.deleteRecordButtonClickHandler = this.deleteRecordButtonClickHandler.bind(this);
  }

  deleteRecordButtonClickHandler(historyIndex) {
    const {
      actions,
      cellId,
      history,
    } = this.props;

    actions.tableDeleteCellHistory(cellId, historyIndex);
    if (history.size - 1 === 0) {
      actions.uiClose();
    }
  }

  render() {
    const {
      actions,
      cellId,
      cellValue,
      history,
    } = this.props;

    // TODO: export to CSV.
    // TODO: "forget all" button.
    // TODO: add option to not save history somewhere (spreadsheet settings?).
    //   Think about default value.
    // TODO: delay uiClose() until ripple animation stops.

    return (
      <div
        className="cell-history"
        onClick={(evt) => {
          // Prevents firing documentClickHandler().
          evt.nativeEvent.stopImmediatePropagation();
        }}
      >
        <Paper>
          <IconButton
            className="close-button"
            onClick={() => actions.uiClose()}
          >
            <CloseIcon />
          </IconButton>
          <Table>
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
                const unixTime = entry.get('unixTime');
                const formattedDatetime = datetime(
                  new Date(unixTime * 1000),
                  { timeDelim: ':' }
                );
                const historyValue = entry.get('value');

                return (
                  <TableRow
                    key={`${unixTime}-${historyValue}`}
                    hover={true}
                  >
                    <TableCell>
                      <IconButton
                        onClick={() => this.deleteRecordButtonClickHandler(historyIndex)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        disabled={historyValue === cellValue}
                        onClick={() => actions.tableSetProp(cellId, 'value', historyValue)}
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
        </Paper>
      </div>
    );
  }
}

CellHistory.propTypes = propTypes;
CellHistory.defaultProps = defaultProps;

export default CellHistory;
