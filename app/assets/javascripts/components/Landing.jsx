import PropTypes from 'prop-types';
import React from 'react';

import { initialState } from '../core';

const propTypes = {
  message: PropTypes.string,
  recaptchaSitekey: PropTypes.string,
};

const defaultProps = {
  message: '',
  recaptchaSitekey: '',
};

class Landing extends React.Component {
  // For recaptcha.
  // REVIEW: is there are better way?
  componentWillMount() {
    const script = document.createElement('script'); // eslint-disable-line no-undef

    // When using toString optimize-minimize 'eats' function's name.
    script.innerHTML = 'function recaptchaCallback() { document.getElementsByName("landing")[0].submit(); }';
    document.body.appendChild(script); // eslint-disable-line no-undef
  }

  render() {
    const {
      message,
      recaptchaSitekey,
    } = this.props;

    const table = JSON.stringify(initialState().toJS().table);

    // TODO: consider storage session data.
    delete table.session;

    let captchaProps = {};
    if (recaptchaSitekey) {
      captchaProps = {
        'data-sitekey': recaptchaSitekey,
        'data-callback': 'recaptchaCallback',

        // TODO: add some kind of spinner.
        onClick: (evt) => { evt.target.disabled = true; }, // eslint-disable-line no-param-reassign
      };
    }

    return (
      <div className="landing">
        <div className="message">
          {message}
        </div>
        <form name="landing" method="POST" action="spreadsheet">
          <input hidden readOnly name="table" value={table} />
          <button
            {...captchaProps}
            className={
              `${recaptchaSitekey ? 'g-recaptcha' : ''}
              mdl-button mdl-js-button mdl-button--raised mdl-button--colored`
            }
            type="submit"
          >
            create spreadsheet
          </button>
        </form>
      </div>
    );
  }
}

Landing.propTypes = propTypes;
Landing.defaultProps = defaultProps;

export default Landing;
