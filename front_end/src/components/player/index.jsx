import Raven from 'raven-js';
import classNames from 'classnames';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import CSSModules from 'react-css-modules';
import { Link } from 'react-router-dom';
import NotificationSystem from 'react-notification-system';

import {
  playNext,
  setIsPlaying,
  mergeNextPlaylist,
  togglePlayNextItem,
  orderSongByValue,
  scrollToSong,
  emitIsLoading,
  toggleRepeat,
  setProgress,
} from 'actions';
import {
  roundUp, formatTime, offsetLeft, isTouchDevice,
} from 'utils/misc';
import * as orderingTypes from 'constants/filter_types';

import styles from './player.css';

const cx = classNames.bind(styles);

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      volume: 1,
      inSetProgressMode: false,
      inSetVolumeMode: false,
      isMuted: false,
      isRemainingTime: false,
      isTouch: isTouchDevice(),
    };
    this.notificationSystem = null;
    this.isProgressMouse = false;
    this.player = React.createRef();
  }

  componentDidMount() {
    const { activeSong } = this.props;
    if (activeSong.id !== '' && this.player.current.readyState === 0) {
      this.player.current.load(); // this is a case when we are loading song from localStorage
    }
    // capturing mouse up everywhere and stopping setting song progress
    document.addEventListener('mouseup', e => this.stopSetProgress(e, true));
    document.addEventListener('mouseup', e => this.stopSetVolume(e, true));
    // capturing touchend, touchcancel everywhere and stopping setting song progress
    document.addEventListener('touchend', e => this.stopSetProgress(e, true));
    document.addEventListener('touchcancel', e => this.stopSetProgress(e, true));
  }

  componentDidUpdate(prevProps) {
    const { activeSong, isLoading, isPlaying } = this.props;
    const isPlayerPlaying = !this.player.current.paused;
    // handling song loading
    if (activeSong.id !== prevProps.activeSong.id) {
      this.songEnded();
      this.player.current.load(); // loading song after previous has ended
    }
    // handling play/pause
    if (isPlaying !== prevProps.isPlaying) {
      if (!isLoading && !isPlayerPlaying && isPlaying) {
        this.safePlay();
      } else {
        this.player.current.pause();
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', e => this.stopSetProgress(e, true));
    document.removeEventListener('mouseup', e => this.stopSetVolume(e, true));
    document.removeEventListener('touchend', e => this.stopSetProgress(e, true));
    document.removeEventListener('touchcancel', e => this.stopSetProgress(e, true));
  }

  onCanPlay() {
    const { emitIsLoading, isPlaying } = this.props;
    emitIsLoading(false);
    if (isPlaying) {
      // this fires when we set progress or load song
      this.safePlay();
    }
  }

  onPause() {
    // used when Safari uses pause from touchbar
    // here we need to ignore onEnded callback and props isLoading
    const { progress, setIsPlaying, isLoading } = this.props;
    if (progress < 1 && !isLoading) {
      setIsPlaying(false);
    }
  }

  onPlay() {
    // used when Safari uses play from touchbar
    const { setIsPlaying } = this.props;
    setIsPlaying(true);
  }

  onLoadedData() {
    const { progress } = this.props;
    this.player.current.currentTime = this.player.current.duration * progress; // setting progress from localStorage
  }

  setProgress(evt, working = true) {
    const { noSongs, isLoading, setProgress } = this.props;
    const { inSetProgressMode } = this.state;
    if (inSetProgressMode && !noSongs && !isLoading && working) {
      const elem = evt.target;
      let clientX = null;
      try {
        // for touch devices
        // eslint-disable-next-line
        clientX = evt.nativeEvent.changedTouches[0].clientX;
      } catch (e) {
        // fallback for non touch devices
        // eslint-disable-next-line
        clientX = evt.clientX;
      }
      let progress = (clientX - offsetLeft(elem)) / elem.clientWidth;
      if (progress >= 1) {
        progress = 0.98; // hack to prevent reaching the end of the media to prevent firing onEnded
      } else if (progress <= 0) {
        progress = 0; // preventing from progress being negative because it will incorrectly display on FE
      }
      this.player.current.currentTime = this.player.current.duration * progress;
      setProgress(progress);
      this.isProgressMouse = true;
    }
  }

  setVolume(evt) {
    const { inSetVolumeMode, isMuted } = this.state;
    if (inSetVolumeMode) {
      const elem = evt.target;
      let newIsMuted = isMuted;
      let newVolume = (evt.clientX - offsetLeft(elem)) / elem.clientWidth;
      if (newVolume <= 0.05) {
        newVolume = 0;
        newIsMuted = true;
      } else {
        newIsMuted = false;
      }
      this.player.current.volume = newVolume;
      this.setState({
        volume: newVolume,
        isMuted: newIsMuted,
      });
    }
  }

  stopSetVolume = (evt, force = false) => {
    if (!force) {
      this.setVolume(evt);
    }
    this.setState({
      inSetVolumeMode: false,
    });
  };

  handlePreloadPlaylist(force) {
    const {
      playlist, activeSong, mergeNextPlaylist,
      isRepeat, setIsPlaying, playNext,
    } = this.props;
    const total = playlist.results.length;
    const current = playlist.results.findIndex(song => song.id === activeSong.id);
    // checking if playlist is at nearly end
    // because we'll load pagination and use it for next life cycle
    if (current + 2 === total) {
      // checking if playlist has next pagination
      if (playlist.next) {
        mergeNextPlaylist(playlist.next);
      }
    }
    const nextSongInPlaylist = current < total - 1 ? current + 1 : 0;
    const nextPlaylistId = !force && isRepeat ? current : nextSongInPlaylist;
    // when we have only 1 song in playlist we'll pause and not use loader
    if (total === 1) {
      setIsPlaying(false);
    } else {
      this.songEnded();
    }
    const nextSong = playlist.results[nextPlaylistId];
    playNext(nextSong);
  }

  next(evt, force = false) {
    // 'force' is used when we need to ignore repeat mode

    /** Priorities:
      - Has no songs
      - Repeat
      - Play Next
      - Preload Playlist
    */

    const { noSongs, isRepeat, playNextList } = this.props;

    if (noSongs) {
      // passing because of no songs
    } else if (!force && isRepeat) {
      this.handleRepeat();
    } else if (playNextList.length > 0) {
      // checking if playNextList isn't empty and picking up songs from it
      // handle 'Play Next list' and exit to skip Preloading playlist
      this.handlePlayNextList();
    } else {
      this.handlePreloadPlaylist(force);
    }
  }

  prev() {
    const {
      noSongs, playlist, activeSong, playNext,
    } = this.props;
    if (!noSongs) {
      const total = playlist.results.length;
      const current = playlist.results.findIndex(song => song.id === activeSong.id);
      const prevId = current > 0 ? current - 1 : total - 1;
      const previous = playlist.results[prevId];
      // checking if song is single in playlist and ignoring action
      if (total !== 1) {
        this.songEnded();
        playNext(previous);
      }
    }
  }

  handleScrollIntoView() {
    const {
      songs, activeSong, scrollToSong,
    } = this.props;
    const currentUrl = window.location.pathname;
    const songInPlaylistId = songs.results.findIndex(song => song.id === activeSong.id);
    if (songInPlaylistId !== -1 && currentUrl === '/') {
      // it means that active song is in current playlist and we are on playlist page so we can scrollIntoView
      scrollToSong(activeSong.id);
    } else if (this.notificationSystem) {
      // showing warning instead
      this.notificationSystem.addNotification({
        message: "This song isn't visible or you aren't on playlist page",
        level: 'warning',
        autoDismiss: 4,
        dismissible: 'none',
      });
    }
  }

  randomize() {
    const { orderingType, orderSongByValue } = this.props;
    if (orderingType === orderingTypes.RANDOM) {
      orderSongByValue(orderingTypes.UPLOADED_DATE);
    } else {
      orderSongByValue(orderingTypes.RANDOM);
    }
  }

  songEnded() {
    const { setProgress } = this.props;
    this.player.current.pause();
    setProgress(0);
  }

  togglePlay() {
    const { noSongs, setIsPlaying, isPlaying } = this.props;
    if (!noSongs) {
      setIsPlaying(!isPlaying);
    }
  }

  toggleMute() {
    const { isMuted, volume } = this.state;
    const newIsMuted = isMuted;
    const newVolume = isMuted ? volume : 0;
    this.player.current.volume = newVolume;
    this.setState({ isMuted: !newIsMuted });
  }

  listenProgress() {
    const { isLoading, setProgress } = this.props;
    if (!isLoading) {
      setProgress(this.player.current.currentTime / this.player.current.duration);
    }
  }

  startSetProgress(evt, working = true) {
    const { isLoading } = this.props;
    if (!isLoading && working) {
      this.isProgressMouse = false;
      this.setProgress(evt);
      this.setState({
        inSetProgressMode: true,
      });
    }
  }

  stopSetProgress(evt, force = false, working = true) {
    const { isLoading } = this.props;
    if (!isLoading && working) {
      if (!force && this.isProgressMouse !== true) {
        this.setProgress(evt);
      }
      this.setState({
        inSetProgressMode: false,
      });
    }
  }

  startSetVolume(evt) {
    this.setVolume(evt);
    this.setState({
      inSetVolumeMode: true,
    });
  }

  listenWheelVolume(evt) {
    const { isMuted } = this.state;
    let newVolume = 0;
    const changeSpeed = 0.1;
    let newIsMuted = isMuted;
    const oldVolume = this.player.current.volume;
    if (evt.deltaY > 0) {
      newVolume = oldVolume - changeSpeed;
    } else {
      newVolume = oldVolume + changeSpeed;
    }
    if (newVolume > 1) {
      newVolume = 1;
    } else if (newVolume <= 1 && newVolume >= 0.05) {
      this.player.current.volume = newVolume;
      newIsMuted = false;
    } else {
      newVolume = 0;
      newIsMuted = true;
    }
    this.player.current.volume = newVolume;
    this.setState({
      volume: newVolume,
      isMuted: newIsMuted,
    });
  }

  handleRepeat() {
    this.player.current.currentTime = 0;
    this.player.current.play();
  }

  handlePlayNextList() {
    const { playNextList, playNext, togglePlayNextItem } = this.props;
    const nextSong = playNextList[0];
    playNext(nextSong);
    togglePlayNextItem(nextSong);
  }

  safePlay() {
    const { setIsPlaying } = this.props;
    // method for handling Safari 11 blocking with message
    const playPromise = this.player.current.play();
    // In browsers that don’t yet support this functionality,
    // playPromise won’t be defined.
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        if (error.name === 'NotAllowedError') {
          // Automatic playback failed.
          setIsPlaying(false);
        }
        Raven.captureException(error);
      });
    }
  }

  repeat() {
    const { isRepeat, toggleRepeat } = this.props;
    toggleRepeat(!isRepeat);
  }

  toggleRemainingTime() {
    const { isRemainingTime } = this.state;
    this.setState({ isRemainingTime: !isRemainingTime });
  }

  render() {
    const {
      isPlaying, isLoading, orderingType, isRepeat,
      progress, activeSong,
    } = this.props;
    const {
      isMuted, isTouch, isRemainingTime, volume,
    } = this.state;
    const songDuration = this.player.current ? this.player.current.duration : 0;
    const playerClsName = cx({
      fa: true,
      'fa-play-circle-o': !isPlaying && !isLoading,
      'fa-pause-circle-o': isPlaying && !isLoading,
      'fa-circle-o-notch fa-spin': isLoading,
    });
    const randomClass = cx({
      'control-button': true,
      active: orderingType === orderingTypes.RANDOM,
    });
    const repeatClass = cx({
      'control-button': true,
      active: isRepeat,
    });
    const volumeClass = cx({
      fa: true,
      'fa-volume-up': !isMuted,
      'fa-volume-off': isMuted,
    });
    let progressBarSliderLeft = '0px'; // this is done to allow better user experience
    if (progress >= 0 && progress < 0.1 && isTouch) {
      progressBarSliderLeft = '6px'; // we are allowing slider to be slightly to the right (only touch devices)
    } else if (progress >= 0.978 && isTouch) {
      progressBarSliderLeft = '-2px'; // or to the left to allow user to better drag slider (only touch devices)
    }
    return (
      <footer styleName="player">
        <NotificationSystem ref={(n) => { this.notificationSystem = n; }} />
        <div styleName="player__bar">
          <div styleName="player__bar__left">
            <div styleName="now-playing">
              <div styleName="cover-art shadow now-playing__cover-art">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={this.handleScrollIntoView.bind(this)}
                  onKeyDown={this.handleScrollIntoView.bind(this)}
                >
                  <img
                    styleName="cover-art-image cover-art-image-loaded"
                    src={activeSong.small_image_thumbnail || '/static/img/song_default_small.png'}
                    alt="cover for current artist"
                  />
                </div>
              </div>

              <div styleName="track-info ellipsis-one-line">
                <div styleName="track-info__name ellipsis-one-line">
                  <div styleName="track-info__name ellipsis-one-line">
                    <div styleName="react-contextmenu-wrapper">
                      {activeSong.album ? (
                        <Link
                          to={`/artist/${activeSong.artist.slug}/${activeSong.album.slug}/`}
                          className="a-underlined"
                        >
                          {activeSong.name}
                        </Link>
                      ) : (
                        <Link to={`/artist/${activeSong.artist.slug}/`} className="a-underlined">
                          {activeSong.name}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="link-subtle" styleName="track-info__artists ellipsis-one-line">
                  <span>
                    <span styleName="react-contextmenu-wrapper">
                      <Link to={`/artist/${activeSong.artist.slug}/`} className="a-underlined">
                        {activeSong.artist.name}
                      </Link>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div styleName="player__bar__center">
            <div styleName="player-controls">
              <div styleName="player-controls__buttons">
                <button
                  type="submit"
                  onClick={this.randomize.bind(this)}
                  className="fa fa-random"
                  styleName={randomClass}
                  title="Randomize"
                />
                <button
                  type="button"
                  onClick={this.prev.bind(this)}
                  className="fa fa-backward"
                  styleName="control-button"
                  title="Previous"
                />
                <button
                  type="button"
                  onClick={this.togglePlay.bind(this)}
                  className={playerClsName}
                  styleName="control-button control-button--circled"
                  title="Play"
                />
                <button
                  type="submit"
                  onClick={e => this.next(e, true)}
                  className="fa fa-forward"
                  styleName="control-button"
                  title="Next"
                />
                <button
                  type="button"
                  onClick={this.repeat.bind(this)}
                  className="fa fa-repeat"
                  styleName={repeatClass}
                  title="Enable repeat"
                />
              </div>

              <div styleName="playback-bar">
                <div styleName="playback-bar__progress-time">{formatTime(progress * songDuration)}</div>
                <div
                  role="slider"
                  aria-valuemin="0"
                  aria-valuemax="1"
                  aria-valuenow={progress}
                  tabIndex={0}
                  onTouchStart={e => this.startSetProgress(e, isTouch)}
                  onTouchMove={e => this.setProgress(e, isTouch)}
                  onTouchEnd={e => this.stopSetProgress(e, false, isTouch)}
                  onTouchCancel={e => this.stopSetProgress(e, false, isTouch)}
                  onMouseDown={e => this.startSetProgress(e, !isTouch)}
                  onMouseMove={e => this.setProgress(e, !isTouch)}
                  onMouseUp={e => this.stopSetProgress(e, false, !isTouch)}
                  styleName="progress-bar"
                >
                  <div styleName="middle-align progress-bar__bg">
                    <div
                      styleName="progress-bar__fg"
                      style={{
                        width: `${roundUp(progress * 100, 100)}%`,
                      }}
                    />
                    <div
                      styleName="middle-align progress-bar__slider"
                      style={{
                        left: `calc(${progressBarSliderLeft} + ${roundUp(progress * 100, 100)}%)`,
                      }}
                    />
                  </div>
                </div>
                <div
                  role="progressbar"
                  tabIndex={0}
                  styleName="playback-bar__progress-time"
                  onClick={this.toggleRemainingTime.bind(this)}
                  onKeyDown={this.toggleRemainingTime.bind(this)}
                >
                  {!isRemainingTime
                    ? formatTime(activeSong.length)
                    : `- ${formatTime(activeSong.length - progress * songDuration)}`}
                </div>
              </div>
            </div>
          </div>

          <audio
            ref={this.player}
            onEnded={() => this.next()}
            onCanPlayThrough={this.onCanPlay.bind(this)}
            onTimeUpdate={this.listenProgress.bind(this)}
            onPause={this.onPause.bind(this)}
            onPlay={this.onPlay.bind(this)}
            onLoadedData={this.onLoadedData.bind(this)}
            autoPlay={false}
            preload="none"
          >
            <source src={activeSong.audio_file} type="audio/mp3" />
            <track kind="captions" src="" srcLang="en" />
          </audio>

          <div styleName="player__bar__right">
            <div styleName="now-playing-bar__right__inner">
              <div styleName="extra-controls">
                <span styleName="connect-device-picker" style={{ display: 'none' }}>
                  <button type="button" className="fa fa-heart" styleName="control-button" />
                </span>

                <div onWheel={this.listenWheelVolume.bind(this)} styleName="volume-bar">
                  <button
                    type="button"
                    onClick={this.toggleMute.bind(this)}
                    className={volumeClass}
                    styleName="control-button volume-bar__icon"
                  />

                  <div
                    role="slider"
                    aria-valuemin="0"
                    aria-valuemax="1"
                    aria-valuenow={volume}
                    tabIndex={0}
                    onMouseDown={this.startSetVolume.bind(this)}
                    onMouseMove={this.setVolume.bind(this)}
                    onMouseUp={this.stopSetVolume}
                    styleName="progress-bar"
                  >
                    <div styleName="middle-align progress-bar__bg">
                      <div
                        styleName="progress-bar__fg"
                        style={{
                          width: isMuted > 0 ? 0 : `${roundUp(volume * 100, 100)}%`,
                        }}
                      />
                      <div
                        styleName="middle-align progress-bar__slider"
                        style={{
                          left: isMuted > 0 ? 0 : `${roundUp(volume * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeSong: state.activeSong,
    isPlaying: state.isPlaying,
    playlist: state.playlist,
    songs: state.songs,
    noSongs: state.noSongs,
    playNextList: state.playNextList,
    orderingType: state.orderingType,
    isLoading: state.isLoading,
    isRepeat: state.isRepeat,
    progress: state.progress,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      playNext,
      setIsPlaying,
      mergeNextPlaylist,
      togglePlayNextItem,
      orderSongByValue,
      scrollToSong,
      emitIsLoading,
      toggleRepeat,
      setProgress,
    },
    dispatch,
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CSSModules(Player, styles, { allowMultiple: true }));
