import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';

import SongApi from 'api/song_api';
import { Loader } from 'components/loaders';
import Highlighter from 'utils/highlighter';
import { formatTime, roundDown } from 'utils/misc';
import {
  setIsPlaying,
  playNext,
  searchSong,
  setPlaylist,
  togglePlayNextItem,
  scrollToSong,
} from 'actions';

import styles from './song.css';

const cx = classNames.bind(styles);


class Song extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lyrics: null,
      isLyricsOpen: false,
    };
    this.songRef = React.createRef();
  }

  componentDidUpdate() {
    const { song, scrollToSong, scrollIntoViewSong } = this.props;
    if (song.id === scrollIntoViewSong) {
      // setting `scrollIntoViewSong` to be null
      scrollToSong(null);
      this.songRef.current.scrollIntoView();
    }
  }

  handleClickAuthor(name) {
    const { setLocalSearch, searchSong } = this.props;
    setLocalSearch(name);
    searchSong(name, true);
  }

  handleClickName() {
    const { lyrics, isLyricsOpen } = this.state;
    const { song } = this.props;
    if (!lyrics && song.has_lyrics) {
      this.setState({
        isLyricsOpen: !isLyricsOpen,
      });
      SongApi.getSongLyrics(song.id).then((songObject) => {
        this.setState({
          lyrics: songObject.lyrics,
        });
      });
    } else if (song.has_lyrics) {
      this.setState({
        isLyricsOpen: !isLyricsOpen,
      });
    } else {
      this.handlePlay();
    }
  }

  handlePlay() {
    const {
      setPlaylist, songs, activeSong, song, playNext,
      setIsPlaying, isPlaying, playNextList, togglePlayNextItem,
    } = this.props;
    setPlaylist(songs); // setting new playlist to keep sync search with playlist
    // if clicked song isn't active then switch to next song
    if (song.id !== activeSong.id) {
      playNext(song, true);
    } else {
      // if song is active then toggle isPlaying
      setIsPlaying(!isPlaying);
    }
    // remove item from playNextList if we clicked on it
    const songInPlaylistId = playNextList.findIndex(tSong => tSong.id === song.id);
    if (songInPlaylistId !== -1) {
      togglePlayNextItem(song);
    }
  }

  handleClick(evt) {
    const { target } = evt;
    if (!target.getAttribute('role')) {
      // if element have a role attribute then it will handle onClick himself
      this.handlePlay();
    }
  }

  playClass() {
    const {
      song, activeSong, isLoading, isPlaying,
    } = this.props;
    let returnCls = 'fa fa-play-circle';
    if (song.id === activeSong.id && isLoading) {
      returnCls = 'fa fa-circle-o-notch fa-spin playlist__song__overlay--loading';
    } else if (song.id === activeSong.id && isPlaying) {
      returnCls = 'fa fa-pause-circle';
    }
    return returnCls;
  }

  render() {
    const {
      playNextList, song, activeSong,
      searchSongValue, togglePlayNextItem,
    } = this.props;
    const { isLyricsOpen, lyrics } = this.state;
    const isNextPlaySong = playNextList.findIndex(tSong => tSong.id === song.id) !== -1;
    const listClass = cx({
      'playlist--hover': true,
      'playlist--border': true,
      'playlist--active': song.id === activeSong.id,
    });
    const songNameCls = cx({
      playlist__song__title: true,
      'playlist__song__title--has-lyrics': song.has_lyrics,
    });
    const playNextCls = cx({
      playlist__right__play_next: true,
      'playlist__right__play_next--active': isNextPlaySong,
    });
    const playlistTimeCls = cx({
      hidden: isNextPlaySong,
    });
    return (
      <li
        role="row"
        onClick={this.handleClick.bind(this)}
        onKeyDown={this.handleClick.bind(this)}
        className="pointer"
        styleName={listClass}
        ref={this.songRef}
      >
        <div className="font-small" styleName="playlist__song">
          <div styleName="playlist__song__image">
            <i className={this.playClass()} styleName="playlist__song__overlay" aria-hidden="true" />
            <img
              styleName="playlist__song__artist__image"
              src={song.extra_sm_image_thumbnail || '/static/img/song_default.png'}
              alt="artist small thumbnail in playlist"
            />
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={this.handleClickAuthor.bind(this, song.artist.name)}
            onKeyDown={this.handleClickAuthor.bind(this, song.artist.name)}
            className="link-light a-underlined content--truncate"
            styleName="playlist__song__author__name"
          >
            {searchSongValue ? (
              <Highlighter
                highlightClassName="marked"
                className="cant-touch"
                searchWords={searchSongValue.split(/[, ]+/)}
                textToHighlight={song.artist.name}
              />
            ) : (
              song.artist.name
            )}
          </div>
          <div className="content--truncate" styleName="playlist__separator">•</div>
          <div
            role="button"
            tabIndex={0}
            onClick={this.handleClickName.bind(this)}
            onKeyDown={this.handleClickName.bind(this)}
            className="content--truncate font-medium link-dark"
            styleName={songNameCls}
          >
            {searchSongValue ? (
              <Highlighter
                highlightClassName="marked"
                className="cant-touch"
                searchWords={searchSongValue.split(/[, ]+/)}
                textToHighlight={song.name}
              />
            ) : (
              song.name
            )}
          </div>

          <div styleName="playlist__right">
            <div styleName="playlist__right__kbs" title="Song bitrate">
              {roundDown(song.bitrate / 1000)}
              /kbps
            </div>

            <div className={playlistTimeCls} title="Song length" styleName="playlist__right__time">
              {formatTime(song.length)}
            </div>
          </div>

          <div
            className="fa fa-indent"
            styleName={playNextCls}
            title="Add to Play next queue"
            role="button"
            tabIndex={0}
            onKeyDown={togglePlayNextItem.bind(this, song)}
            onClick={togglePlayNextItem.bind(this, song)}
          />
        </div>
        {isLyricsOpen && (
          <div styleName="playlist__lyrics">
            {lyrics ? (
              <div
                className="scrollbar-custom"
                styleName="playlist__lyrics__inner"
                // it's safe because our backend parses songs
                // eslint-disable-next-line
                dangerouslySetInnerHTML={{
                  __html: lyrics,
                }}
              />
            ) : (
              <Loader />
            )}
          </div>
        )}
      </li>
    );
  }
}


function mapStateToProps(state) {
  return {
    songs: state.songs,
    activeSong: state.activeSong,
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    searchSongValue: state.searchSongValue,
    playNextList: state.playNextList,
    scrollIntoViewSong: state.scrollIntoViewSong,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setIsPlaying,
      playNext,
      searchSong,
      setPlaylist,
      togglePlayNextItem,
      scrollToSong,
    },
    dispatch,
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CSSModules(Song, styles, { allowMultiple: true }));
