import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import Waypoint from 'react-waypoint';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';

import SongApi from 'api/song_api';
import Song from 'components/song';
import { Loader, BottomLoader } from 'components/loaders';
import * as orderingTypes from 'constants/filter_types';
import {
  searchSong,
  mergeNextSongs,
  filterSongByTag,
  orderSongByValue,
} from 'actions';

import styles from './playlist.css';

const cx = classNames.bind(styles);


class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFilterOpen: false,
      tags: [],
    };
    this.searchInput = React.createRef();
    this.emitChangeDebounced = debounce(this.emitChange, 700);
  }

  componentDidMount() {
    const { searchSongValue } = this.props;
    this.searchInput.current.value = searchSongValue;
  }

  componentWillUnmount() {
    this.emitChangeDebounced.cancel();
  }

  getNextSongs = () => {
    const {
      songs, searchSongValue, isSearchSongLoading, mergeNextSongs,
    } = this.props;
    const hasSongs = songs.next;
    const searchHasResult = searchSongValue && !songs.results.length;
    if (hasSongs && !searchHasResult && !isSearchSongLoading) {
      mergeNextSongs(songs.next);
    }
  }

  setLocalSearch = (value) => {
    this.searchInput.current.value = value;
  }

  loadTags() {
    const { tags } = this.state;
    if (tags.length === 0) {
      SongApi.getTags().then((tagsObject) => {
        this.setState({
          tags: tagsObject,
        });
      });
    }
  }

  emitChange(value) {
    const { searchSong } = this.props;
    searchSong(value, false);
  }

  handleChange(event) {
    const { target } = event;
    this.emitChangeDebounced(target.value);
  }

  toggleFilter() {
    const { isFilterOpen } = this.state;
    this.setState({
      isFilterOpen: !isFilterOpen,
    });
    this.loadTags();
  }

  handleTagClick(evt, tag) {
    const { isFilterOpen } = this.state;
    const { filterSongByTag } = this.props;
    this.setState({
      isFilterOpen: !isFilterOpen,
    });
    filterSongByTag(tag);
  }

  handleOrderingClick(evt, orderingValue) {
    const { isFilterOpen } = this.state;
    const { orderSongByValue } = this.props;
    this.setState({
      isFilterOpen: !isFilterOpen,
    });
    orderSongByValue(orderingValue);
  }

  activeTagClass(tag, initial = null) {
    const { filterTagValue } = this.props;
    let returnCls = 'playlist__controls__options__item';
    if (filterTagValue && tag && filterTagValue.slug === tag.slug) {
      returnCls = 'playlist__controls__options__item playlist__controls__options__item--active';
    } else if (!filterTagValue && initial) {
      returnCls = 'playlist__controls__options__item playlist__controls__options__item--active';
    }
    return returnCls;
  }

  activeTagClassAria(tag, initial = null) {
    // returns true/false for ARIA specification
    const { filterTagValue } = this.props;
    let returnBool = false;
    if (filterTagValue && tag && filterTagValue.slug === tag.slug) {
      returnBool = true;
    } else if (!filterTagValue && initial) {
      returnBool = true;
    }
    return returnBool;
  }

  activeOrderingClass(oType) {
    const { orderingType } = this.props;
    if (orderingType === oType) {
      return 'playlist__controls__options__item playlist__controls__options__item--active';
    }
    return 'playlist__controls__options__item';
  }

  render() {
    const {
      isSearchSongLoading, songs, noSongs,
      searchSongValue, filterTagValue, orderingType,
    } = this.props;
    const { isFilterOpen, tags } = this.state;
    const filterButtonCls = cx({
      playlist__controls__button: true,
      'playlist__controls__button--active': isFilterOpen,
    });
    const filterDivCls = cx({
      'scrollbar-custom': true,
      hidden: !isFilterOpen,
    });
    return (
      <div className="app__container">
        <div styleName="playlist__controls">
          <div styleName="playlist__controls__search">
            <input
              onChange={e => this.handleChange(e)}
              ref={this.searchInput}
              className="content--truncate"
              spellCheck="false"
              styleName="playlist__controls__search__input"
              placeholder="Search for artists, bands, tracks"
              type="search"
            />
          </div>

          <div styleName="playlist__controls__right">
            <button
              type="submit"
              onClick={this.toggleFilter.bind(this)}
              className="content--truncate"
              styleName={filterButtonCls}
            >
              {filterTagValue ? filterTagValue.name : 'All music genres'}
            </button>
            <div role="menu" className={filterDivCls} styleName="playlist__controls__options">
              <div styleName="playlist__controls__options__headline">Ordering:</div>
              <div styleName="playlist__controls__options__inner first">
                <div
                  role="menuitemradio"
                  tabIndex={0}
                  aria-checked={orderingType === orderingTypes.POPULARITY}
                  onKeyDown={e => this.handleOrderingClick(e, orderingTypes.POPULARITY)}
                  onClick={e => this.handleOrderingClick(e, orderingTypes.POPULARITY)}
                  styleName={this.activeOrderingClass(orderingTypes.POPULARITY)}
                >
                  Popularity
                </div>
                <div
                  role="menuitemradio"
                  tabIndex={0}
                  aria-checked={orderingType === orderingTypes.RANDOM}
                  onKeyDown={e => this.handleOrderingClick(e, orderingTypes.RANDOM)}
                  onClick={e => this.handleOrderingClick(e, orderingTypes.RANDOM)}
                  styleName={this.activeOrderingClass(orderingTypes.RANDOM)}
                >
                  Random
                </div>
                <div
                  role="menuitemradio"
                  tabIndex={0}
                  aria-checked={orderingType === orderingTypes.UPLOADED_DATE}
                  onKeyDown={e => this.handleOrderingClick(e, orderingTypes.UPLOADED_DATE)}
                  onClick={e => this.handleOrderingClick(e, orderingTypes.UPLOADED_DATE)}
                  styleName={this.activeOrderingClass(orderingTypes.UPLOADED_DATE)}
                >
                  Uploaded date
                </div>
              </div>
              <div styleName="playlist__controls__options__headline">Genres:</div>
              <div styleName="playlist__controls__options__inner">
                {tags.length === 0 && !noSongs ? (
                  <Loader />
                ) : (
                  <div
                    role="menuitemradio"
                    tabIndex={0}
                    aria-checked={this.activeTagClassAria(orderingTypes.ALL_TAGS, true)}
                    onKeyDown={e => this.handleTagClick(e, orderingTypes.ALL_TAGS)}
                    onClick={e => this.handleTagClick(e, orderingTypes.ALL_TAGS)}
                    styleName={this.activeTagClass(orderingTypes.ALL_TAGS, true)}
                  >
                    All music genres
                  </div>
                )}

                {tags.map(tag => (
                  <div
                    role="menuitemradio"
                    tabIndex={0}
                    aria-checked={this.activeTagClassAria(tag)}
                    onKeyDown={e => this.handleTagClick(e, tag)}
                    onClick={e => this.handleTagClick(e, tag)}
                    styleName={this.activeTagClass(tag)}
                    key={tag.id}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="m-3vh" styleName="playlist">
          {noSongs ? (
            <h3 className="default-center">
              You&#39;ve got no songs yet, &nbsp;
              <Link className="default-link" to="/upload/">
                upload some
              </Link>
            </h3>
          ) : null}
          <ul styleName="playlist--nostyle" role="table">
            {!isSearchSongLoading
              ? songs.results.map(song => (
                <Song
                  key={song.id}
                  song={song}
                  setLocalSearch={this.setLocalSearch}
                />
              ))
              : null}
            {songs.next || isSearchSongLoading ? <BottomLoader /> : null}
            <Waypoint bottomOffset="-200px" onEnter={this.getNextSongs} />
            {searchSongValue && !songs.results.length && !isSearchSongLoading ? (
              <p className="search-error-text">
                The search for
                <strong>{` ${searchSongValue} `}</strong>
                returned no matches in
                {' '}
                <strong>{filterTagValue ? filterTagValue.name : 'your audios'}</strong>
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
    songs: state.songs,
    noSongs: state.noSongs,
    orderingType: state.orderingType,
    filterTagValue: state.filterTagValue,
    searchSongValue: state.searchSongValue,
    isSearchSongLoading: state.isSearchSongLoading,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      searchSong,
      mergeNextSongs,
      filterSongByTag,
      orderSongByValue,
    },
    dispatch,
  );
}

const PlaylistWithStyles = CSSModules(Playlist, styles, { allowMultiple: true });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PlaylistWithStyles);
