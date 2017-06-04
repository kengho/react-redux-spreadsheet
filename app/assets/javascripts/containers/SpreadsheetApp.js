import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as RequestsActions from '../actions/requests';
import * as TableActions from '../actions/table';
import * as UndoRedoActions from '../actions/undoRedo';
import Spreadsheet from '../components/Spreadsheet';

function mapStateToProps(state) {
  return {
    undo: {
      canRedo: state.get('table').future.length > 0,
      canUndo: state.get('table').past.length > 0,
    },
    meta: state.get('meta'),
    requests: state.get('requests'),
    table: state.get('table').present,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        ...RequestsActions,
        ...TableActions,
        ...UndoRedoActions,
      }, dispatch),
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Spreadsheet);
