import GithubMark from 'react-github-mark';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import getRootPath from './../lib/getRootPath';
import Landing from './Landing';
import Spreadsheet from './Spreadsheet';

const propTypes = {
  dialog: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  requests: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
  undo: PropTypes.object.isRequired,
};

const defaultProps = {
};

class App extends Component {
  render() {
    const rootPath = getRootPath();

    let pathname = document.location.pathname;
    if (pathname.slice(pathname.length - 1) !== '/') {
      pathname += '/';
    }
    let Component;
    if (pathname === rootPath) {
      Component = <Landing actions={this.props.actions} />;
    } else {
      Component = <Spreadsheet {...this.props } rootPath={rootPath} />;
    }

    return (
      <div>
        {Component}
        <GithubMark
          href="https://github.com/kengho/react-redux-spreadsheet"
          position="bottom-right"
        />
      </div>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
