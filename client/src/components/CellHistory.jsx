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
import rippleButtonAction from '../lib/rippleButtonAction';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

const defaultProps = {
};

class CellHistory extends React.PureComponent {
  constructor(props) {
    super(props);

    this.deleteRecordButtonClickHandler = this.deleteRecordButtonClickHandler.bind(this);
  }

  deleteRecordButtonClickHandler(evt, historyIndex) {
    const {
      actions,
      cellId,
      history,
    } = this.props;

    const deletePropAction = () => actions.deleteCellHistory(cellId, historyIndex);
    if (history.size - 1 === 0) {
      const action = () => {
        deletePropAction();
        if (history.size - 1 === 0) {
          actions.closeUi();
        }
      };
      rippleButtonAction(action)(evt);
    } else {
      deletePropAction();
    }
  }

  render() {
    const {
      actions,
      cellId,
      history,
      value,
    } = this.props;

    // TODO: export to CSV.
    // TODO: "forget all" button.
    // TODO: add option to not save history somewhere (spreadsheet settings?).
    //   Think about default value.

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
            onClick={rippleButtonAction(() => actions.closeUi())}
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
                const time = entry.get('time');
                const formattedDatetime = datetime(
                  new Date(time),
                  { timeDelim: ':' }
                );
                const historyValue = entry.get('value') || '';

                return (
                  <TableRow
                    key={`${time}-${historyValue}`}
                    hover={true}
                  >
                    <TableCell>
                      <IconButton
                        onClick={(evt) => this.deleteRecordButtonClickHandler(evt, historyIndex)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        disabled={historyValue === value}
                        onClick={() => actions.setProp(cellId, 'value', historyValue)}
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
