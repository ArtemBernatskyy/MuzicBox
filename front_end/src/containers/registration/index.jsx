import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';

import styles from './registration.css';

class AuthPage extends PureComponent {
  static handleLogin() {
    localStorage.clear();
  }

  render() {
    return (
      <div className="app__container">
        <div styleName="loginbox__container">
          <div styleName="loginbox__inner">
            <h1>MUZICBOX</h1>
            <div styleName="login__inner__buttons">
              <a
                onClick={AuthPage.handleLogin}
                href="/oauth/login/facebook/"
                className="btn btn--success"
                styleName="facebook__button"
              >
                LOG IN WITH FACEBOOK
              </a>
              <button type="submit" role="link" disabled className="btn" styleName="twitter__button">
                LOG IN WITH TWITTER
                <small>(coming soon)</small>
              </button>
              <button type="submit" role="link" disabled className="btn" styleName="google__button">
                LOG IN WITH GOOGLE
                <small>(coming soon)</small>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const LoginWithStyles = CSSModules(AuthPage, styles, { allowMultiple: true });

export default LoginWithStyles;
