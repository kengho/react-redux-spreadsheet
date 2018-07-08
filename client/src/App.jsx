import { ConnectedRouter } from 'connected-react-router/immutable';
import { Route, Switch } from 'react-router';
import GithubMark from 'react-github-mark';
import Loadable from 'react-loadable';
import PropTypes from 'prop-types';
import React from 'react';

import './App.css';
import getRootPath, { getSpreadsheetPathTemplate } from './lib/getRootPath';

const Dialog = Loadable({
  loader: () => import('./containers/Dialog/Dialog'),
  loading: () => <div />,
});
const ErrorPageNotFound = Loadable({
  loader: () => import('./containers/ErrorPageNotFound'),
  loading: () => <div />,
});
const Landing = Loadable({
  loader: () => import('./containers/Landing'),
  loading: () => <div />,
});
const Spreadsheet = Loadable({
  loader: () => import('./containers/Spreadsheet'),
  loading: () => <div />,
});
Spreadsheet.preload();

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
