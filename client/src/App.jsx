import { ConnectedRouter } from 'connected-react-router/immutable';
import { Route, Switch } from 'react-router';
import GithubMark from 'react-github-mark';
import loadable from 'loadable-components';
import PropTypes from 'prop-types';
import React from 'react';

import './App.css';
import getRootPath, { getSpreadsheetPathTemplate } from './lib/getRootPath';

const Dialog = loadable(() => import('./containers/Dialog/Dialog'));
const ErrorPageNotFound = loadable(() => import('./containers/ErrorPageNotFound'));
const Landing = loadable(() => import('./containers/Landing'));
const Spreadsheet = loadable(() => import('./containers/Spreadsheet'));
Spreadsheet.load();

const propTypes = {
  history: PropTypes.object.isRequired,
};

const App = ({ history }) => {
  const spreadsheetPathTemplate = getSpreadsheetPathTemplate();
  const rootPath = getRootPath();

  // NOTE: is there is div around everything,
  //   it should have height css property in order
  //   for .data to have 100% height.
  return (
    <React.Fragment>
      <ConnectedRouter history={history}>
        <Switch>
          <Route exact path={rootPath} component={Landing} />
          <Route exact path={spreadsheetPathTemplate} component={Spreadsheet} />
          <Route component={ErrorPageNotFound} />
        </Switch>
      </ConnectedRouter>
      <Dialog />
      <GithubMark
        href="https://github.com/kengho/react-redux-spreadsheet"
        position="bottom-right"
      />
    </React.Fragment>
  );
}

App.propTypes = propTypes;

export default App;
