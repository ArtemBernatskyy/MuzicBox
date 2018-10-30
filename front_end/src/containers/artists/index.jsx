import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Waypoint from 'react-waypoint';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';

import Highlighter from 'utils/highlighter';
import { BottomLoader } from 'components/loaders';
import { mergeNextArtists, searchArtists } from 'actions';

import styles from './artists.css';

class ArtistsPage extends Component {
  constructor(props) {
    super(props);
    this.emitChangeDebounced = debounce(this.emitChange, 700);
  }

  componentDidMount() {
    const { artists, searchArtistValue, mergeNextArtists } = this.props;
    if (artists.results.length === 0 && !searchArtistValue) {
      // we need to load artists only once
      mergeNextArtists(artists.next);
    }
    // settings search value
    this.search_input.value = searchArtistValue;
  }

  componentWillUnmount() {
    this.emitChangeDebounced.cancel();
  }

  getNextArtists = () => {
    const {
      artists, searchArtistValue, isSearchArtistLoading, mergeNextArtists,
    } = this.props;
    const hasArtists = artists.next;
    const searchHasResult = searchArtistValue && !artists.results.length;
    if (hasArtists && !searchHasResult && !isSearchArtistLoading) {
      mergeNextArtists(artists.next);
    }
  }

  handleChange(event) {
    this.emitChangeDebounced(event.target.value);
  }

  emitChange(value) {
    const { searchArtists } = this.props;
    searchArtists(value);
  }

  render() {
    const {
      noSongs, searchArtistValue, isSearchArtistLoading, artists,
    } = this.props;
    return (
      <div className="app__container">
        <div styleName="container">
          <div styleName="search">
            <span styleName="search__span">
              <div styleName="search__form">
                <input
                  onChange={e => this.handleChange(e)}
                  ref={(input) => {
                    this.search_input = input;
                  }}
                  spellCheck="false"
                  type="search"
                  className="content--truncate"
                  styleName="search__input"
                  placeholder="Start typing artist name"
                />
              </div>
            </span>
          </div>

          <ul className="list-nostyle">
            {noSongs ? (
              <h3 className="default-center">
                You&#39;ve got no artists yet, &nbsp;
                <Link className="default-link" to="/upload/">
                  upload some songs
                </Link>
              </h3>
            ) : null}
            {!isSearchArtistLoading
              ? artists.results.map(artist => (
                <li key={artist.id} styleName="item">
                  <div styleName="item__inner">
                    <div styleName="artwork">
                      <Link to={`/artist/${artist.slug}/`}>
                        <div styleName="artwork__image">
                          <div styleName="image">
                            <img
                              styleName="image__span"
                              alt="artist cover"
                              src={artist.small_image_thumbnail || '/static/img/artist_default_small.png'}
                            />
                          </div>
                        </div>
                      </Link>
                      <div styleName="artwork__play-button">
                        <Link
                          to={`/artist/${artist.slug}/`}
                          styleName="button__play button"
                          className="fa fa-play-circle"
                        />
                      </div>
                    </div>

                    <div styleName="description">
                      <Link
                        to={`/artist/${artist.slug}/`}
                        className="link-dark font-big font-light"
                        styleName="description__heading truncate"
                      >
                        {searchArtistValue ? (
                          <Highlighter
                            highlightClassName="marked"
                            searchWords={searchArtistValue.split(/[, ]+/)}
                            textToHighlight={artist.name}
                          />
                        ) : (
                          artist.name
                        )}
                      </Link>
                      <div styleName="artist__heading">
                        <Link
                          to={`/artist/${artist.slug}/`}
                          className="link-light font-small font-light"
                          styleName="truncate"
                        >
                          {`${artist.songs_count} songs`}
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))
              : null}
            {artists.next || isSearchArtistLoading ? <BottomLoader /> : null}
            <div styleName="item">
              <Waypoint styleName="item" bottomOffset="-250px" onEnter={this.getNextArtists} />
            </div>
            {searchArtistValue
              && !artists.results.length
              && !isSearchArtistLoading ? (
                <p className="search-error-text">
                  The search for
                  <strong>{` ${searchArtistValue} `}</strong>
                  returned no matches in your artists
                </p>
              ) : null}
          </ul>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    artists: state.artists,
    searchArtistValue: state.searchArtistValue,
    noSongs: state.noSongs,
    isSearchArtistLoading: state.isSearchArtistLoading,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ mergeNextArtists, searchArtists }, dispatch);
}

const ArtistsPageWithStyles = CSSModules(ArtistsPage, styles, {
  allowMultiple: true,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ArtistsPageWithStyles);
