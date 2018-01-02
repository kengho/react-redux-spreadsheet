import { ConnectedRouter } from 'connected-react-router/immutable';
import { Route, Switch } from 'react-router';
import GithubMark from 'react-github-mark';
import PropTypes from 'prop-types';
import React from 'react';

import './App.css';
import Dialog from './containers/Dialog/Dialog';
import ErrorPageNotFound from './containers/ErrorPageNotFound';
import getRootPath from './lib/getRootPath';
import Landing from './containers/Landing';
import Spreadsheet from './containers/Spreadsheet';

const propTypes = {
  history: PropTypes.object.isRequired,
};

const App = ({ history }) => {
  const rootPath = getRootPath();

  // NOTE: is there is div around everything,
  //   it should have height css property in order
  //   for .data to have 100% height.
  return ([
    <ConnectedRouter key="router" history={history}>
      <Switch>
        <Route exact path={rootPath} component={Landing} />
        <Route exact path={`${rootPath}:shortId`} component={Spreadsheet} />
        <Route component={ErrorPageNotFound}/>
      </Switch>
    </ConnectedRouter>,
    <Dialog key="dialog" />,
    <GithubMark
      key="github-mark"
      href="https://github.com/kengho/react-redux-spreadsheet"
      position="bottom-right"
    />,
  ]);
}

App.propTypes = propTypes;

export default App;
