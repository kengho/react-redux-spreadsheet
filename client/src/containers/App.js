import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as DialogActions from '../actions/dialog';
import * as MetaActions from '../actions/meta';
import * as RequestsActions from '../actions/requests';
import * as TableActions from '../actions/table';
import * as UndoRedoActions from '../actions/undoRedo';
import Router from './Router';

function mapStateToProps(state) {
  return {
    dialog: state.get('dialog'),
    meta: state.get('meta'),
    requests: state.get('requests'),
    table: state.get('table').present,
    undo: {
      canRedo: state.get('table').future.length > 0,
      canUndo: state.get('table').past.length > 1, // omitting SET_TABLE_FROM_JSON
    },
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        ...DialogActions,
        ...MetaActions,
        ...RequestsActions,
        ...TableActions,
        ...UndoRedoActions,
      }, dispatch),
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Router);
