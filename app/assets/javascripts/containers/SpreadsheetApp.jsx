import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Spreadsheet from '../components/Spreadsheet';
import * as TableActions from '../actions/table';
import * as RequestsActions from '../actions/requests';

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
