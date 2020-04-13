import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import loadable from 'loadable-components';
import React from 'react';

import { initialState } from '../core';
import { OFFLINE, ROW, MENU } from '../constants';
import * as MetaActions from '../actions/meta';
import * as ServerActions from '../actions/server';
import * as SettingsActions from '../actions/settings';
import * as TableActions from '../actions/table';
import * as UiActions from '../actions/ui';
import * as UndoRedoActions from '../actions/undoRedo';
import EditingCell from '../components/Table/EditingCell';
import fetchServer from '../lib/fetchServer';
import getRootPath from '../lib/getRootPath';
import LoadingScreen from '../components/LoadingScreen';
import Table from '../components/Table/Table';

const CellHistory = loadable(() => import('../components/Popup/CellHistory'));
const CurrentSelection = loadable(() => import('../components/CurrentSelection'));
const Menu = loadable(() => import('../components/Popup/Menu'));
const SearchBar = loadable(() => import('../components/SearchBar'));
const SyncIndicator = loadable(() => import('../components/SyncIndicator'));

const mapStateToProps = (state, ownProps) => {
  // (?) TODO: canUndo and canRedo to table.
  const table = state.table;
  return {
    canRedo: table.future.length > 0,
    canUndo: table.past.length > 1, // omitting ActionTypes.MERGE_SERVER_STATE
    requests: state.requests,
    server: state.server,
    settings: state.settings,
    shortId: ownProps.match.params.shortId,
    table: table.present.major,
    ui: state.ui,
    currentSelection: table.present.minor.currentSelection,
    currentSelectionVisibility: table.present.minor.currentSelection.visibility,
    linesOffsets: table.present.minor.linesOffsets,
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...MetaActions,
      ...ServerActions,
      ...SettingsActions,
      ...TableActions,
      ...UiActions,
      ...UndoRedoActions,
    }, dispatch),
  },
});

class Spreadsheet extends React.Component {
  constructor(props) {
    super(props);

    this.state = { loaded: false };
  }

  componentDidMount() {
    const {
      actions,
      history,
      shortId,
    } = this.props;

    // Don't fetch data from server in tests.
    if (process.env.NODE_ENV === 'test') {
      actions.setShortId('test');
      return;
    }

    if (shortId.toLowerCase() !== OFFLINE.toLowerCase()) {
      fetchServer('GET', `show?short_id=${shortId}`)
        .then((json) => {
          let parsedServerState;
          let errors;
          if (json.data && json.data.state) {
            try {
              parsedServerState = JSON.parse(json.data.state);
            } catch(err) {
              errors = ['Sory, data is corrupted, please contact us.'];
            }
          } else {
            if (json.errors) {
              errors = json.errors.map((error) => error.detail);
            } else {
              errors = ['Sorry, something went wrong, please try later.'];
            }
          }

          if (!parsedServerState) {
            actions.setErrors(errors);
            history.push(getRootPath());
          } else {
            actions.setShortId(shortId.toLowerCase());
            actions.setSync(true);
            actions.mergeServerState(parsedServerState);
            actions.closePopup(MENU); // test_9898
            this.setState({ loaded: true });
          }
        });
    } else {
      actions.setErrors([]); // for not to show previous messages after going back in history
      actions.setShortId(OFFLINE.toLowerCase()); // shortIds
      actions.setSync(false);
      actions.mergeServerState(initialState());
      this.setState({ loaded: true });
    }
  }

  render() {
    const {
      currentSelection, // so it won't pass to Table
      linesOffsets, // so it won't pass to Table
      ...other
    } = this.props;
    const headerHeight = this.props.table.layout[ROW].marginSize;

    if (this.state.loaded) {
      return (
        <React.Fragment>
          <Table {...other} />
          <EditingCell
            {...other}
            linesOffsets={linesOffsets}
          />
          <Menu {...other} />
          <CellHistory {...other} />
          <SyncIndicator server={this.props.server} />
          <CurrentSelection currentSelection={currentSelection} headerHeight={headerHeight} />

          {/*
            NOTE: key prop allows to reset internal SearchBar state
              if some data changed. After data changes SearchBar should
              search again from "clean slate", which is the most simple
              and reliable approach.
          */}
          <SearchBar
            {...other}
            key={this.props.table.layout[ROW].list}
          />
        </React.Fragment>
      );
    } else {
      return <LoadingScreen />;
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Spreadsheet);
