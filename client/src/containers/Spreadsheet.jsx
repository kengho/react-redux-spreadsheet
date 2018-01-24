import { bindActionCreators } from 'redux';
import React from 'react';

import {
  initialState,
} from '../core';
import * as DetachmentsActions from '../actions/detachments';
import * as LandingActions from '../actions/landing'; // setLandingMessages()
import * as MetaActions from '../actions/meta';
import * as RequestsActions from '../actions/requests';
import * as SettingsActions from '../actions/settings';
import * as TableActions from '../actions/table';
import * as UiActions from '../actions/ui';
import * as UndoRedoActions from '../actions/undoRedo';
import connectWithSkippingProps from '../lib/connectWithSkippingProps';
import fetchServer from '../lib/fetchServer';
import getRootPath from '../lib/getRootPath';
import LoadingScreen from '../components/LoadingScreen';
import Overlay from '../components/Overlay';
import SyncIndicator from '../components/SyncIndicator';
import Table from '../components/Table';

const mapStateToProps = (state) => ({
  canRedo: state.get('table').future.length > 0,
  canUndo: state.get('table').past.length > 1, // omitting ActionTypes.SET_TABLE_FROM_JSON
  detachments: state.get('detachments'),
  meta: state.get('meta'),
  requests: state.get('requests'),
  settings: state.get('settings'),
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
      ...SettingsActions,
      ...TableActions,
      ...UiActions,
      ...UndoRedoActions,
    }, dispatch),
  },
});

class Spreadsheet extends React.Component {
  componentDidMount() {
    const {
      actions,
      history,
      match,
      table,
    } = this.props;

    // Don't fetch data from server in tests.
    if (process.env.NODE_ENV === 'test') {
      actions.setShortId('1');

      const initialJSONTable = JSON.stringify(initialState(3, 4).get('table'));
      actions.setTableFromJSON(initialJSONTable);
      return;
    }

    if (table.getIn(['data', 'rows']).size > 0) {
      return;
    }

    // Fetch data after initial render.
    const shortId = match.params.shortId;
    if (shortId === 'offline') {
      const initialJSONTable = JSON.stringify(initialState().get('table'));
      actions.setShortId(shortId);
      actions.setTableFromJSON(initialJSONTable);
      actions.setSync(false);
    } else {
      fetchServer('GET', `show?short_id=${shortId}`)
        .then((json) => {
          if (json.errors) {
            const errors = json.errors.map((error) => error.detail);

            actions.setLandingMessages(errors);
            history.push(getRootPath());
          } else {
            // store's shortId used in handleRequestsChanges().
            actions.setShortId(shortId);
            actions.setTableFromJSON(json.data.table);
            actions.setSettingsFromJSON(json.data.settings);
          }
        });
    }
  }

  render() {
    // Extracting props.
    const {
      history,
      requests,
      ...other,
    } = this.props;

    // Non-extracting props (should be passed to children as well).
    const {
      meta, // uses in Table (until there are TableMenu)
      table, // uses in Table
    } = this.props;

    const rows = table.getIn(['data', 'rows']);
    if (rows.size === 0) {
      return <LoadingScreen />;
    } else {
      return [
        <Table key="table" {...other} />,
        <SyncIndicator
          key="sync-indicator"
          requestsQueueLength={requests.get('queue').size}
          sync={meta.get('sync')}
        />,
        <div key="after-table" style={{ height: '90vh' }}/>,
        <Overlay key="overlay" />
      ];
    }
  }
}

const detachmentsProps = ['detachments'];

export default connectWithSkippingProps(
  mapStateToProps,
  mapDispatchToProps,
  detachmentsProps
)(Spreadsheet);
