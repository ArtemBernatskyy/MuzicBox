import Hammer from 'react-hammerjs';
import { connect } from 'react-redux';
import debounce from 'lodash/debounce';
import React, { Component } from 'react';
import classNames from 'classnames/bind';
import CSSModules from 'react-css-modules';
import { bindActionCreators } from 'redux';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import Menu from 'components/menu';
import { toggleMenu } from 'actions';
import FAQPage from 'components/faq';
import NotFound from 'components/404';
import Header from 'components/header';
import Player from 'components/player';
import Upload from 'components/upload';
import Playlist from 'components/playlist';
import ArtistsPage from 'components/artists';
import AuthPage from 'components/registration';
import ArtistsDetail from 'components/artist_detail';

import styles from './base.css';

const cx = classNames.bind(styles);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollVisible: false,
    };
    this.handleScroll = debounce(this.handleScroll, 200);
  }

  scrollToTop = () => {
    this.mainDiv.scrollTop = 0;
  }

  handleScroll() {
    if (this.mainDiv.scrollTop > 300) {
      this.setState({
        scrollVisible: true,
      });
    } else {
      this.setState({
        scrollVisible: false,
      });
    }
  }

  toggleMenu(bool) {
    const { toggleMenu } = this.props;
    toggleMenu(bool);
  }

  render() {
    const { isMenuOpen } = this.props;
    const { scrollVisible } = this.state;
    const backgroundClass = cx({
      menu__background: true,
      'menu__background--open': isMenuOpen,
    });
    const scrollClass = cx({
      scroll: true,
      hidden_opacity: !scrollVisible,
    });

    return (
      <BrowserRouter>
        <div>
          <Header />

          <div onScroll={e => this.handleScroll(e)} className="app">
            <Hammer
              options={{
                recognizers: {
                  swipe: { direction: Hammer.DIRECTION_LEFT },
                },
              }}
              onTap={() => this.toggleMenu(false)}
              onSwipe={() => this.toggleMenu(false)}
            >
              <div className={backgroundClass} />
            </Hammer>
            <Menu />

            <Hammer
              options={{
                recognizers: {
                  swipe: { direction: Hammer.DIRECTION_RIGHT },
                },
              }}
              onSwipe={() => this.toggleMenu(true)}
            >
              <div ref={(ref) => { this.mainDiv = ref; }} className="app__center scrollbar-custom bg-white">
                <Switch>
                  <Route exact path="/" component={Playlist} />
                  <Route exact path="/upload/" component={Upload} />
                  <Route exact path="/auth/" component={AuthPage} />
                  <Route exact path="/artists/" component={ArtistsPage} />
                  <Route path="/artist/:slug" component={ArtistsDetail} />
                  <Route exact path="/faq/" component={FAQPage} />
                  <Route component={NotFound} />
                </Switch>
              </div>
            </Hammer>

            <button
              type="button"
              title="Back to top"
              className={scrollClass}
              onClick={this.scrollToTop}
            >
              <span className="arrow-up glyphicon fa fa-chevron-up" />
            </button>
          </div>

          <Player />
        </div>
      </BrowserRouter>
    );
  }
}

function mapStateToProps(state) {
  return { isMenuOpen: state.isMenuOpen };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ toggleMenu }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CSSModules(App, { allowMultiple: true }));
