import { bindActionCreators } from 'redux';
import React from 'react';

import {
  initialState,
} from '../core';
import * as DetachmentsActions from '../actions/detachments';
import * as LandingActions from '../actions/landing'; // landingSetMessages()
import * as MetaActions from '../actions/meta';
import * as RequestsActions from '../actions/requests';
import * as TableActions from '../actions/table';
import * as UiActions from '../actions/ui';
import * as UndoRedoActions from '../actions/undoRedo';
import connectWithSkippingProps from '../lib/connectWithSkippingProps';
import fetchServer from '../lib/fetchServer';
import getRootPath from '../lib/getRootPath';
import LoadingScreen from '../components/LoadingScreen';
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
  componentDidMount() {
    // Don't fetch data from server in tests.
    if (process.env.NODE_ENV === 'test') {
      this.props.actions.metaSetShortId('1');

      const initialJSONTable = JSON.stringify(initialState(4, 4).get('table').present);
      this.props.actions.tableSetFromJSON(initialJSONTable);
      return;
    }

    // Fetch data after initial render.
    if (this.props.table.getIn(['data', 'rows']).size === 0) {
      const shortId = this.props.match.params.shortId;
      fetchServer('GET', `show?short_id=${shortId}`)
        .then((json) => {
          if (json.errors) {
            const errors = json.errors.map((error) => error.detail);

            this.props.actions.landingSetMessages(errors);
            this.props.history.push(getRootPath());
          } else {
            // store's shortId used in handleRequestsChanges().
            this.props.actions.metaSetShortId(shortId);
            this.props.actions.tableSetFromJSON(json.data.table);
          }
        });
    }
  }

  render() {
    const rows = this.props.table.getIn(['data', 'rows']);
    if (rows.size === 0) {
      return <LoadingScreen />;
    } else {
      return <Table {...this.props} />;
    }
  }
}

const detachmentsProps = ['detachments'];

export default connectWithSkippingProps(
  mapStateToProps,
  mapDispatchToProps,
  detachmentsProps
)(Spreadsheet);
