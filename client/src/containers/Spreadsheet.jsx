import { bindActionCreators } from 'redux';
import React from 'react';

import * as DetachmentsActions from '../actions/detachments';
import * as LandingActions from '../actions/landing'; // landingSetMessages()
import * as MetaActions from '../actions/meta';
import * as RequestsActions from '../actions/requests';
import * as TableActions from '../actions/table';
import * as UiActions from '../actions/ui';
import * as UndoRedoActions from '../actions/undoRedo';
import connectWithSkippingProps from '../lib/connectWithSkippingProps';
import Table from '../components/Table';

const mapStateToProps = (state) => ({
  canRedo: state.get('table').future.length > 0,
  canUndo: state.get('table').past.length > 1, // omitting TABLE/SET_TABLE_FROM_JSON
  detachments: state.get('detachments'),
  requests: state.get('requests'),
  table: state.get('table').present,
  ui: state.get('ui'),
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...DetachmentsActions,
      ...LandingActions,
      ...MetaActions,
      ...RequestsActions,
      ...TableActions,
      ...UiActions,
      ...UndoRedoActions,
    }, dispatch),
  },
});

class Spreadsheet extends React.Component {
  render() {
    return <Table {...this.props} />;
  }
}

const detachmentsProps = ['detachments'];

export default connectWithSkippingProps(
  mapStateToProps,
  mapDispatchToProps,
  detachmentsProps
)(Spreadsheet);
