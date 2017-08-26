import PropTypes from 'prop-types';
import React from 'react';
import Recaptcha from 'react-google-invisible-recaptcha';

import './Landing.css';
import { initialState } from '../core';
import fetchServer from './../lib/fetchServer';
import getRootPath from './../lib/getRootPath';

const propTypes = {
  actions: PropTypes.object.isRequired,
  landing: PropTypes.object.isRequired,
};

const defaultProps = {
};

const DELAY_BEFORE_ACTION = 200;

class Landing extends React.Component {
  constructor(props) {
    super(props);

    this.recaptcha = null;
    this.onButtonClickHandler = this.onButtonClickHandler.bind(this);
    this.onRecaptchaResolved = this.onRecaptchaResolved.bind(this);
  }

  onRecaptchaResolved(evt) {
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
          const errors = json.errors.map((error) => error.detail);
          this.props.actions.setMessages(errors);
          this.button.disabled = false; // eslint-disable-line no-param-reassign
        } else {
          const rootPath = getRootPath();
          window.location.replace(`${rootPath}${json.data.short_id}`); // eslint-disable-line no-undef
        }
      });
  }

  componentDidMount() {
    componentHandler.upgradeElement(this.button); // eslint-disable-line no-undef
  }

  onButtonClickHandler(evt) {
    // Fixes error
    // 'Uncaught TypeError: Cannot read property 'parentNode' of null'
    // and warning
    // 'Warning: This synthetic event is reused for performance reasons ...'.
    evt.persist();

    setTimeout(
      () => {
        // TODO: add some kind of spinner.
        // After upgradeElement() in componentDidMount() ripple container added to DOM,
        // so button itself becomes parent of what you click.
        evt.target.parentNode.disabled = true; // eslint-disable-line no-param-reassign

        if (this.recaptcha) {
          this.recaptcha.execute();
        } else {
          this.onRecaptchaResolved();
        }
      },
      DELAY_BEFORE_ACTION
    );
  }

  render() {
    const messages = this.props.landing.get('messages');
    const recaptchaSitekey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

    const outputMessages = [];
    messages.forEach((message) => {
      outputMessages.push(<li key={message}>{message}</li>);
    });

    return (
      <div className="landing">
        <button
          className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect"
          onClick={this.onButtonClickHandler}
          ref={(c) => { this.button = c; }}
        >
          create spreadsheet
        </button>
        <div className="messages">
          <ul>
            {outputMessages}
          </ul>
        </div>
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
