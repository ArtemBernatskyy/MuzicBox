import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CSSModules from 'react-css-modules';

import { handleLogin } from 'actions';
import styles from './registration.css';

const AuthPage = (props) => {
  const { handleLogin } = props;
  return (
    <div className="app__container">
      <div styleName="loginbox__container">
        <div styleName="loginbox__inner">
          <h1>MUZICBOX</h1>
          <div styleName="login__inner__buttons">
            <button
              type="submit"
              onClick={handleLogin}
              className="btn btn--success"
              styleName="facebook__button"
            >
              LOG IN WITH FACEBOOK
            </button>
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
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ handleLogin }, dispatch);
}

export default connect(
  null,
  mapDispatchToProps,
)(CSSModules(AuthPage, styles, { allowMultiple: true }));
