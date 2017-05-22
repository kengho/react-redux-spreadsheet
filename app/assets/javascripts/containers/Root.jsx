import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { setShortId } from '../actions/meta';
import { setTableFromJSON } from '../actions/table';
import configureStore from '../store/configureStore';
import SpreadsheetApp from './SpreadsheetApp';

const store = configureStore();

const propTypes = {
  shortId: PropTypes.string.isRequired,
  table: PropTypes.string.isRequired,
};

export default class Root extends Component {
  componentWillMount() {
    store.dispatch(setTableFromJSON(this.props.table));
    store.dispatch(setShortId(this.props.shortId));
  }

  render() {
    return (
      <Provider store={store}>
        <SpreadsheetApp />
      </Provider>
    );
  }
}

Root.propTypes = propTypes;
