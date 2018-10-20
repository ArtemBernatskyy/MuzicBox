import React, { Component } from "react";
import CSSModules from "react-css-modules";

import styles from "./registration.css";

class AuthPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleLogin() {
    this.sooqadsds();
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
                onClick={this.handleLogin.bind(this)}
                href="/oauth/login/facebook/"
                className="btn btn--success"
                styleName="facebook__button"
              >
                LOG IN WITH FACEBOOK
              </a>
              <button disabled className="btn" styleName="twitter__button">
                LOG IN WITH TWITTER
                <small>(coming soon)</small>
              </button>
              <button disabled className="btn" styleName="google__button">
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

let LoginWithStyles = CSSModules(AuthPage, styles, { allowMultiple: true });

export default LoginWithStyles;
