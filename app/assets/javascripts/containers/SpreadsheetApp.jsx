import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as RequestsActions from '../actions/requests';
import * as TableActions from '../actions/table';
import Spreadsheet from '../components/Spreadsheet';

function mapStateToProps(state) {
  return {
    meta: state.get('meta'),
    table: state.get('table'),
    requests: state.get('requests'),
  };
}

function mapDispatchToProps(dispatch) {
  return { actions: { ...bindActionCreators({ ...TableActions, ...RequestsActions }, dispatch) } };
}

export default connect(mapStateToProps, mapDispatchToProps)(Spreadsheet);
