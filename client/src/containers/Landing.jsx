import PropTypes from 'prop-types';
import React from 'react';
import Recaptcha from 'react-google-invisible-recaptcha';

import './Landing.css';
import { initialState } from '../core';
import fetchServer from './../lib/fetchServer';
import getRootPath from './../lib/getRootPath';

const propTypes = {
  actions: PropTypes.object.isRequired,
  message: PropTypes.string,
};

const defaultProps = {
  message: '',
};

class Landing extends React.Component {
  constructor(props) {
    super(props);

    this.recaptcha = null;
    this.onRecaptchaResolved = this.onRecaptchaResolved.bind(this);
  }

  onRecaptchaResolved() {
    const table = initialState().toJS().table;

    // TODO: consider storage session data.
    delete table.session;

    let fetchParams = { table: JSON.stringify(table) };
    if (this.recaptcha) {
      fetchParams['g-recaptcha-response'] = this.recaptcha.getResponse();
    }

    // Without JSON.stringify Rails tries to parse the whole table,
    // but we only want it to store JSON we sent.
    fetchServer('POST', 'create', fetchParams)
      .then((json) => {
        if (json.errors) {
          // TODO: show error message.
        } else {
          const rootPath = getRootPath();
          window.location.replace(`${rootPath}${json.data.short_id}`); // eslint-disable-line no-undef
        }
      });
  }

  onButtonClickHandler(evt) {
    // TODO: add some kind of spinner.
    evt.target.disabled = true; // eslint-disable-line no-param-reassign

    if (this.recaptcha) {
      this.recaptcha.execute();
    } else {
      this.onRecaptchaResolved();
    }
  }

  render() {
    const { message } = this.props;
    const recaptchaSitekey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

    // TODO: add ripple to button, then disable it after 200ms timeout
    //   (upgrade code in Dialog).
    return (
      <div className="landing">
        <div className="message">
          {message}
        </div>
        <button
          className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
          onClick={(evt) => this.onButtonClickHandler(evt)}
        >
          create spreadsheet
        </button>
        {recaptchaSitekey &&
          <Recaptcha
            ref={(c) => { this.recaptcha = c; }}
            sitekey={recaptchaSitekey}
            onResolved={this.onRecaptchaResolved}
          />
        }
      </div>
    );
  }
}

Landing.propTypes = propTypes;
Landing.defaultProps = defaultProps;

export default Landing;
