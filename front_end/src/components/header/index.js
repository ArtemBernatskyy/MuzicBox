import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import classNames from "classnames";
import { Link } from "react-router-dom";
import CSSModules from "react-css-modules";
import { withRouter } from "react-router-dom";

import { toggleMenu } from "actions";

import styles from "./header.css";

let cx = classNames.bind(styles);

class Header extends Component {
  constructor(props) {
    super(props);
  }

  handleLogoutUrl() {
    const current_url = this.props.history.location.pathname;
    let next_page = this.props.location.pathname;
    // we are checking if we are on artst's detail page
    // and redirecting to the root url
    // because there could be hidden artists
    if (current_url.indexOf("/artist/") >= 0) {
      next_page = "/";
    }
    return `/api/v0/accounts/logout/?next_page=${next_page}`;
  }

  render() {
    let sidebarClass = cx({
      sidebar__icon: true,
      open: this.props.is_menu_open,
    });
    return (
      <div styleName="header">
        <div styleName="header__wrapper">
          <div onClick={this.props.toggleMenu.bind(this, !this.props.is_menu_open)} styleName="sidebar">
            <div styleName={sidebarClass}>
              <span styleName="icon-bar" />
              <span styleName="icon-bar" />
              <span styleName="icon-bar" />
            </div>
          </div>

          <div styleName="logo-container">
            <Link to="/" styleName="logo" className="common-link">
              <img styleName="logo__icon" src="/static/img/muzicbox_small.png" />
            </Link>
          </div>

          <div styleName="auth">
            <div styleName="auth__links-container">
              {window.opts.is_authenticated ? (
                <a href={this.handleLogoutUrl()}>
                  <span>Logout</span>
                </a>
              ) : (
                <div>
                  <Link to="/auth/" styleName="auth__link auth--white-link  auth--transition">
                    <span>Sign In</span>
                  </Link>

                  <span styleName="auth-links__divider">•</span>

                  <Link to="/auth/" styleName="auth__link auth--white-link  auth--transition">
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    is_menu_open: state.is_menu_open,
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      toggleMenu,
    },
    dispatch
  );
}

export default withRouter(
  connect(
    mapStateToProps,
    matchDispatchToProps
  )(CSSModules(Header, styles, { allowMultiple: true }))
);
