import React, { Component } from "react";
import CSSModules from "react-css-modules";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import classNames from "classnames";
import Waypoint from "react-waypoint";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";

import { formatTime, roundDown } from "utils/misc";
import Highlighter from "utils/highlighter";
import SongApi from "api/song_api";
import { Loader, BottomLoader } from "components/common";
import * as ordering_types from "constants/ordering_types";
import {
  setIsPlaying,
  playNext,
  searchSong,
  setPlaylist,
  mergeNextSongs,
  filterSongByTag,
  orderSongByValue,
  togglePlayNextItem,
  scrollToSong,
} from "actions";

import styles from "./playlist.css";

let cx = classNames.bind(styles);

class Song extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lyrics: null,
      is_lyrics_open: false,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.song.id === nextProps.scroll_to_song) {
      // setting `scroll_to_song` to be null
      this.props.scrollToSong(null);
      this._song_ref.scrollIntoView();
    }
  }

  handleClickAuthor(name) {
    this.props.setLocalSearch(name);
    this.props.searchSong(name, true);
  }

  handleClickName() {
    if (!this.state.lyrics && this.props.song.has_lyrics) {
      this.setState({
        is_lyrics_open: !this.state.is_lyrics_open,
      });
      SongApi.getSongLyrics(this.props.song.id).then(song_object => {
        this.setState({
          lyrics: song_object.lyrics,
        });
      });
    } else if (this.props.song.has_lyrics) {
      this.setState({
        is_lyrics_open: !this.state.is_lyrics_open,
      });
    } else {
      this.handlePlay();
    }
  }

  handlePlay() {
    this.props.setPlaylist(this.props.songs); // setting new playlist to keep sync search with playlist
    // if clicked song isn't active then switch to next song
    if (this.props.song.id !== this.props.active_song.id) {
      this.props.playNext(this.props.song, true);
    } else {
      // if song is active then toggle is_playing
      this.props.setIsPlaying(!this.props.is_playing);
    }
    // remove item from play_next_list if we clicked on it
    const song_in_playlist_id = this.props.play_next_list.findIndex(song => song.id == this.props.song.id);
    if (song_in_playlist_id !== -1) {
      this.props.togglePlayNextItem(this.props.song);
    }
  }

  handleClick(evt) {
    let target = evt.target;
    if (target.tagName.toLowerCase() == "span") {
      // checking if target isn't span or a because we have different listener for them
    } else if (
      target.className == "playlist__right__play_next" ||
      target.className == "fa fa-indent" ||
      target.className == "playlist__right__play_next playlist__right__play_next--active"
    ) {
      // checking if target isn't play next and ignoring click and handling it manually
      this.props.togglePlayNextItem(this.props.song);
    } else {
      this.handlePlay();
    }
  }

  playClass() {
    if (this.props.song.id === this.props.active_song.id && this.props.is_loading) {
      return "fa fa-circle-o-notch fa-spin playlist__song__overlay playlist__song__overlay--loading";
    } else if (this.props.song.id === this.props.active_song.id && this.props.is_playing) {
      return "fa fa-pause-circle playlist__song__overlay";
    } else {
      return "fa fa-play-circle playlist__song__overlay";
    }
  }

  render() {
    let isNextPlaySong = this.props.play_next_list.findIndex(song => song.id == this.props.song.id) !== -1;
    let listClass = cx({
      pointer: true,
      "playlist--border": true,
      "playlist--hover": true,
      "playlist--active": this.props.song.id === this.props.active_song.id,
    });
    let lyricsCls = cx({
      playlist__lyrics: true,
      hidden: !this.state.is_lyrics_open,
    });
    let songNameCls = cx({
      "font-medium": true,
      "link-dark": true,
      "a-underlined": this.props.song.has_lyrics,
    });
    let playNextCls = cx({
      playlist__right__play_next: true,
      "playlist__right__play_next--active": isNextPlaySong,
    });
    let playlistTimeCls = cx({
      hidden: isNextPlaySong,
      playlist__right__time: true,
    });
    return (
      <li onClick={this.handleClick.bind(this)} className={listClass} ref={c => (this._song_ref = c)}>
        <div className="font-small playlist__song">
          <div className="playlist__song__image">
            <div className="playlist__song__image__container">
              <i className={this.playClass(this.props.song)} aria-hidden="true" />
              <img
                className="playlist__song__artist__image playlist__song__artist__image--full playlist__song__artwork"
                src={this.props.song.extra_sm_image_thumbnail || "/static/img/song_default.png"}
              />
            </div>
          </div>

          <div className="content--truncate playlist__song__content">
            <span
              onClick={this.handleClickAuthor.bind(this, this.props.song.artist.name)}
              className="link-light a-underlined"
            >
              {this.props.search_song_value ? (
                <Highlighter
                  highlightClassName="marked"
                  searchWords={this.props.search_song_value.split(/[, ]+/)}
                  textToHighlight={this.props.song.artist.name}
                />
              ) : (
                this.props.song.artist.name
              )}
            </span>
            <span className="playlist__separator">•</span>
            <span onClick={this.handleClickName.bind(this)} className={songNameCls}>
              {this.props.search_song_value ? (
                <Highlighter
                  highlightClassName="marked"
                  searchWords={this.props.search_song_value.split(/[, ]+/)}
                  textToHighlight={this.props.song.name}
                />
              ) : (
                this.props.song.name
              )}
            </span>
          </div>

          <div className="playlist__right">
            <div className="playlist__right__kbs">
              <span title="Song bitrate" className="playlist__right__kbs--span">
                {roundDown(this.props.song.bitrate / 1000)}
                /kbps
              </span>
            </div>

            <div className={playlistTimeCls}>
              <span title="Song length" className="playlist__right__time--span">
                {formatTime(this.props.song.length)}
              </span>
            </div>
          </div>
          <div className={playNextCls}>
            <span title="Add to Play next queue" className="playlist__right__play_next--span">
              <i className="fa fa-indent" aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className={lyricsCls}>
          {this.state.lyrics ? (
            <div
              className="playlist__lyrics__inner scrollbar-custom"
              dangerouslySetInnerHTML={{
                __html: this.state.lyrics,
              }}
            />
          ) : (
            <Loader />
          )}
        </div>
      </li>
    );
  }
}

class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_filter_open: false,
      tags: [],
    };
    this.emitChangeDebounced = debounce(this.emitChange, 700);
  }

  componentDidMount() {
    this.search_input_ref.value = this.props.search_song_value;
  }

  componentWillUnmount() {
    this.emitChangeDebounced.cancel();
  }

  handleChange(event) {
    this.emitChangeDebounced(event.target.value);
  }

  emitChange(value) {
    this.props.searchSong(value, false);
  }

  loadTags() {
    if (this.state.tags.length === 0) {
      SongApi.getTags().then(tags_object => {
        this.setState({
          tags: tags_object,
        });
      });
    }
  }

  getNextSongs() {
    let hasSongs = this.props.songs.next;
    let searchHasResult = this.props.search_song_value && !this.props.songs.results.length;
    if (hasSongs && !searchHasResult && !this.props.is_search_song_loading) {
      this.props.mergeNextSongs(this.props.songs.next);
    }
  }

  setLocalSearch(value) {
    this.search_input_ref.value = value;
  }

  toggleFilter() {
    this.setState({
      is_filter_open: !this.state.is_filter_open,
    });
    this.loadTags();
  }

  handleTagClick(evt, tag) {
    this.setState({
      is_filter_open: !this.state.is_filter_open,
    });
    this.props.filterSongByTag(tag);
  }

  handleOrderingClick(evt, ordering_value) {
    this.setState({
      is_filter_open: !this.state.is_filter_open,
    });
    this.props.orderSongByValue(ordering_value);
  }

  activeTagClass(tag, initial = null) {
    if (this.props.filter_tag_value && tag && this.props.filter_tag_value.slug === tag.slug) {
      return "playlist__controls__options__item playlist__controls__options__item--active";
    } else if (!this.props.filter_tag_value && initial) {
      return "playlist__controls__options__item playlist__controls__options__item--active";
    } else {
      return "playlist__controls__options__item";
    }
  }

  activeOrderingClass(o_type) {
    if (this.props.ordering_type === o_type) {
      return "playlist__controls__options__item playlist__controls__options__item--active";
    } else {
      return "playlist__controls__options__item";
    }
  }

  render() {
    let filterButtonCls = cx({
      playlist__controls__button: true,
      "playlist__controls__button--active": this.state.is_filter_open,
    });
    let filterDivCls = cx({
      "scrollbar-custom": true,
      hidden: !this.state.is_filter_open,
    });
    return (
      <div className="app__container">
        <div styleName="playlist__controls">
          <div styleName="playlist__controls__search">
            <input
              onChange={e => this.handleChange(e)}
              ref={input => {
                this.search_input_ref = input;
              }}
              className="content--truncate"
              spellCheck="false"
              styleName="playlist__controls__search__input"
              placeholder="Search for artists, bands, tracks"
              autoFocus={this.props.search_song_value}
              type="search"
            />
          </div>

          <div styleName="playlist__controls__right">
            <button onClick={this.toggleFilter.bind(this)} className="content--truncate" styleName={filterButtonCls}>
              {this.props.filter_tag_value ? this.props.filter_tag_value.name : "All music genres"}
            </button>
            <div className={filterDivCls} styleName="playlist__controls__options">
              <div styleName="playlist__controls__options__headline">Ordering:</div>
              <div styleName="playlist__controls__options__inner first">
                <div
                  onClick={e => this.handleOrderingClick(e, ordering_types.POPULARITY)}
                  styleName={this.activeOrderingClass(ordering_types.POPULARITY)}
                >
                  Popularity
                </div>
                <div
                  onClick={e => this.handleOrderingClick(e, ordering_types.RANDOM)}
                  styleName={this.activeOrderingClass(ordering_types.RANDOM)}
                >
                  Random
                </div>
                <div onClick={e => this.handleOrderingClick(e, null)} styleName={this.activeOrderingClass(null)}>
                  Uploaded date
                </div>
              </div>
              <div styleName="playlist__controls__options__headline">Genres:</div>
              <div styleName="playlist__controls__options__inner">
                {this.state.tags.length === 0 && !this.props.no_songs ? (
                  <Loader />
                ) : (
                  <div
                    onClick={e => this.handleTagClick(e, ordering_types.UPLOADED_DATE)}
                    styleName={this.activeTagClass(ordering_types.UPLOADED_DATE, true)}
                  >
                    All music genres
                  </div>
                )}

                {this.state.tags.map(tag => (
                  <div onClick={e => this.handleTagClick(e, tag)} styleName={this.activeTagClass(tag)} key={tag.id}>
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="m-3vh" styleName="playlist">
          {this.props.no_songs ? (
            <h3 className="default-center">
              You&#39;ve got no songs yet, &nbsp;
              <Link className="default-link" to="/upload/">
                upload some
              </Link>
            </h3>
          ) : null}
          <ul styleName="playlist--nostyle">
            {!this.props.is_search_song_loading
              ? this.props.songs.results.map(song => (
                  <Song
                    key={song.id}
                    song={song}
                    songs={this.props.songs}
                    scroll_to_song={this.props.scroll_to_song}
                    play_next_list={this.props.play_next_list}
                    is_playing={this.props.is_playing}
                    is_loading={this.props.is_loading}
                    active_song={this.props.active_song}
                    search_song_value={this.props.search_song_value}
                    setLocalSearch={this.setLocalSearch.bind(this)}
                    playNext={this.props.playNext.bind(this)}
                    searchSong={this.props.searchSong.bind(this)}
                    setPlaylist={this.props.setPlaylist.bind(this)}
                    setIsPlaying={this.props.setIsPlaying.bind(this)}
                    togglePlayNextItem={this.props.togglePlayNextItem.bind(this)}
                    scrollToSong={this.props.scrollToSong.bind(this)}
                  />
                ))
              : null}
            {this.props.songs.next || this.props.is_search_song_loading ? <BottomLoader /> : null}
            <Waypoint bottomOffset={"-200px"} onEnter={this.getNextSongs.bind(this)} />
            {this.props.search_song_value && !this.props.songs.results.length && !this.props.is_search_song_loading ? (
              <p className="search-error-text">
                The search for <strong>{this.props.search_song_value}</strong> returned no matches in{" "}
                <strong>{this.props.filter_tag_value ? this.props.filter_tag_value.name : "your audios"}</strong>
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
    active_song: state.active_song,
    is_playing: state.is_playing,
    is_loading: state.is_loading,
    search_song_value: state.search_song_value,
    filter_tag_value: state.filter_tag_value,
    no_songs: state.no_songs,
    ordering_type: state.ordering_type,
    play_next_list: state.play_next_list,
    is_search_song_loading: state.is_search_song_loading,
    scroll_to_song: state.scroll_to_song,
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setIsPlaying,
      playNext,
      searchSong,
      setPlaylist,
      mergeNextSongs,
      filterSongByTag,
      orderSongByValue,
      togglePlayNextItem,
      scrollToSong,
    },
    dispatch
  );
}

let PlaylistWithStyles = CSSModules(Playlist, styles, { allowMultiple: true });

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(PlaylistWithStyles);
