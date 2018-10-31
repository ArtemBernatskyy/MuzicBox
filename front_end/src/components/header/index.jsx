import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import CSSModules from 'react-css-modules';
import { Link, withRouter } from 'react-router-dom';

import { toggleMenu } from 'actions';
import { handleLogout } from 'utils/misc';

import styles from './header.css';

const cx = classNames.bind(styles);

class Header extends PureComponent {
  render() {
    const { isMenuOpen, toggleMenu, location } = this.props;
    const sidebarClass = cx({
      sidebar__icon: true,
      open: isMenuOpen,
    });
    return (
      <div styleName="header">
        <div styleName="header__wrapper">
          <div
            role="menuitemcheckbox"
            tabIndex={0}
            aria-checked={!isMenuOpen}
            onKeyDown={() => toggleMenu(!isMenuOpen)}
            onClick={() => toggleMenu(!isMenuOpen)}
            styleName="sidebar"
          >
            <div styleName={sidebarClass}>
              <span styleName="icon-bar" />
              <span styleName="icon-bar" />
              <span styleName="icon-bar" />
            </div>
          </div>

          <div styleName="logo-container">
            <Link to="/" styleName="logo" className="common-link">
              <img styleName="logo__icon" alt="muzicbox logo small" src="/static/img/muzicbox_small.png" />
            </Link>
          </div>

          <div styleName="auth">
            <div styleName="auth__links-container">
              {window.opts.is_authenticated ? (
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={() => handleLogout(location)}
                  onClick={() => handleLogout(location)}
                  className="pointer"
                >
                  <span>Logout</span>
                </div>
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
  return { isMenuOpen: state.isMenuOpen };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ toggleMenu }, dispatch);
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CSSModules(Header, styles, { allowMultiple: true })),
);
