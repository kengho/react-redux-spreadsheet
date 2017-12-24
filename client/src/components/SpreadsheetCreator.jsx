import PropTypes from 'prop-types';
import React from 'react';
import Recaptcha from 'react-google-invisible-recaptcha';

import { initialState } from '../core';
import fetchServer from './../lib/fetchServer';
import getRootPath from './../lib/getRootPath';
import rippleButtonAction from '../lib/rippleButtonAction';
import serverSyncParams from '../lib/serverSyncParams';

const propTypes = {
  actions: PropTypes.object.isRequired,
  beforeRecaptchaExecute: PropTypes.func,
  history: PropTypes.object,
  onErrors: PropTypes.func,
  onRecaptchaResolved: PropTypes.func,
  openInNewTab: PropTypes.bool,
  recaptchaSitekey: PropTypes.string,
  ripple: PropTypes.bool,
};

const defaultProps = {
  beforeRecaptchaExecute: () => {},
  onErrors: () => {},
  onRecaptchaResolved: () => {},
  openInNewTab: false,
  ripple: true,
};

class SpreadsheetCreator extends React.PureComponent {
  constructor(props) {
    super(props);

    this.recaptcha = null;
    this.onChildrenClickHandler = this.onChildrenClickHandler.bind(this);
    this.onRecaptchaResolved = this.onRecaptchaResolved.bind(this);
  }

  onRecaptchaResolved(evt) {
    const {
      actions,
      history,
      onErrors,
      onRecaptchaResolved,
      openInNewTab,
    } = this.props;

    const table = initialState().get('table');

    let params = serverSyncParams(table);
    if (this.recaptcha) {
      params['g-recaptcha-response'] = this.recaptcha.getResponse();
    }

    // TODO: handle errors if server not responding.
    // TODO: consider offline mode.
    //   Issues:
    //   1 short_id?
    fetchServer('POST', 'create', params)
      .then((json) => {
        if (json.errors) {
          const errors = json.errors.map((error) => error.detail);
          onErrors(errors);
        } else {
          if (history && !openInNewTab) {
            const shortId = json.data.short_id;
            const spreadsheetPath = `${getRootPath()}${shortId}`;

            // store's shortId used in handleRequestsChanges().
            actions.setShortId(shortId);

            // TODO: set table from immutable object here, not json.
            actions.setTableFromJSON(JSON.stringify(table));
            history.push(spreadsheetPath);
          } else {
            // ...
          }
        }

        onRecaptchaResolved();
      });
  }

  onChildrenClickHandler(evt) {
    const {
      beforeRecaptchaExecute,
      ripple,
    } = this.props;

    const action = () => {
      beforeRecaptchaExecute();

      if (this.recaptcha) {
        this.recaptcha.execute();
      } else {
        this.onRecaptchaResolved();
      }
    }

    if (ripple) {
      rippleButtonAction(action)(evt);
    } else {
      action(evt);
    }
  }

  render() {
    const {
      children,
      recaptchaSitekey,
    } = this.props;

    const clickableChildren =
      <div key="children">
        {React.cloneElement(children, { onClick: this.onChildrenClickHandler })}
      </div>

    return [
      clickableChildren,
      (recaptchaSitekey &&
        <Recaptcha
          ref={(c) => { this.recaptcha = c; }}
          key="recaptcha"
          sitekey={recaptchaSitekey}
          onResolved={this.onRecaptchaResolved}
        />
      ),
    ];
  }
}

SpreadsheetCreator.propTypes = propTypes;
SpreadsheetCreator.defaultProps = defaultProps;

export default SpreadsheetCreator;
