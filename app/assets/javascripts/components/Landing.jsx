import React from 'react';
import PropTypes from 'prop-types';

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
    const data = JSON.stringify(initialState().toJS().table.data);
    let captchaProps = {};
    if (this.props.recaptchaSitekey) {
      captchaProps = {
        'data-sitekey': this.props.recaptchaSitekey,
        'data-callback': 'recaptchaCallback',
        onClick: (e) => { e.target.disabled = true; }, // TODO: add some kind of spinner.
      };
    }

    return (
      <div className="landing">
        <div className="message">
          {this.props.message}
        </div>
        <form name="landing" method="POST" action="spreadsheet">
          <input hidden readOnly name="data" value={data} />
          <button
            className={
              `${this.props.recaptchaSitekey ? 'g-recaptcha' : ''}
              mdl-button mdl-js-button mdl-button--raised mdl-button--colored`
            }
            {...captchaProps}
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
