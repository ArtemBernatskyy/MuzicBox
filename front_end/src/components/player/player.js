import React, { Component } from "react";
import PropTypes from "prop-types";
import Raven from "raven-js";
import classNames from "classnames";
import { Link } from "react-router-dom";
import NotificationSystem from "react-notification-system";
import CSSModules from "react-css-modules";

import * as ordering_types from "constants/ordering_types";
import { roundUp, formatTime, offsetLeft, isTouchDevice } from "utils/misc";

import styles from "./player.css";

let cx = classNames.bind(styles);

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      volume: 1,
      in_set_progress_mode: false,
      in_set_volume_mode: false,
      is_muted: false,
      is_remaining_time: false,
      is_touch: false,
    };
    this._notificationSystem = null;
    this.is_progress_mouse = false;
  }

  UNSAFE_componentWillMount() {
    this.setState({
      is_touch: isTouchDevice(),
    });
  }

  componentDidMount() {
    if (this.props.active_song.id !== "" && this._player.readyState == 0) {
      this._player.load(); // this is a case when we are loading song from localStorage
    }
    // capturing mouse up everywhere and stopping setting song progress
    document.addEventListener("mouseup", e => this.stopSetProgress(e, true));
    document.addEventListener("mouseup", e => this.stopSetVolume(e, true));
    // capturing touchend, touchcancel everywhere and stopping setting song progress
    document.addEventListener("touchend", e => this.stopSetProgress(e, true));
    document.addEventListener("touchcancel", e => this.stopSetProgress(e, true));
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", e => this.stopSetProgress(e, true));
    document.removeEventListener("mouseup", e => this.stopSetVolume(e, true));
    document.removeEventListener("touchend", e => this.stopSetProgress(e, true));
    document.removeEventListener("touchcancel", e => this.stopSetProgress(e, true));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // checking for first load and loading first song
    if (this.props.active_song.id !== nextProps.active_song.id) {
      this.songEnded();
      this._player.load();
    }

    // toggling play/pause based on props.isPlaying
    // this also allows to control player outside of this component
    if (this.props.isPlaying !== nextProps.isPlaying) {
      if (!this.props.isLoading) {
        if (nextProps.isPlaying) {
          this.safePlay();
        } else {
          this._player.pause();
        }
      }
    }
  }

  safePlay() {
    // method for handling Safari 11 blocking with message
    let play_promise = this._player.play();
    // In browsers that don’t yet support this functionality,
    // play_promise won’t be defined.
    if (play_promise !== undefined) {
      play_promise.catch(error => {
        if (error.name == "NotAllowedError") {
          // Automatic playback failed.
          this.props.setIsPlaying(false);
        }
        Raven.captureException(error);
      });
    }
  }

  onCanPlay() {
    this.props.emitIsLoading(false);
    if (this.props.isPlaying) {
      // this fires when we set progress or load song
      this.safePlay();
    }
  }

  handlePlayNextList() {
    const next_song = this.props.play_next_list[0];
    this.props.playNext(next_song);
    this.props.togglePlayNextItem(next_song);
  }

  handleRepeat() {
    this._player.currentTime = 0;
    this._player.play();
  }

  handlePreloadPlaylist(force) {
    let total = this.props.playlist.results.length;
    let current = this.props.playlist.results.findIndex(song => song.id === this.props.active_song.id);
    // checking if playlist is at nearly end
    // because we'll load pagination and use it for next life cycle
    if (current + 2 === total) {
      // checking if playlist has next pagination
      if (this.props.playlist.next) {
        this.props.mergeNextPlaylist(this.props.playlist.next);
      }
    }
    let next_playlist_id = !force && this.props.is_repeat ? current : current < total - 1 ? current + 1 : 0;
    // when we have only 1 song in playlist we'll pause and not use loader
    if (total === 1) {
      this.props.setIsPlaying(false);
    } else {
      this.songEnded();
    }
    let next_song = this.props.playlist.results[next_playlist_id];
    this.props.playNext(next_song);
  }

  next(evt, force = false) {
    // 'force' is used when we need to ignore repeat mode

    /** Priorities:
      - Has no songs
      - Repeat
      - Play Next
      - Preload Playlist
    */

    if (this.props.no_songs) {
      // passing because of no songs
    } else if (!force && this.props.is_repeat) {
      this.handleRepeat();
    } else if (this.props.play_next_list.length > 0) {
      // checking if play_next_list isn't empty and picking up songs from it
      // handle 'Play Next list' and exit to skip Preloading playlist
      this.handlePlayNextList();
    } else {
      this.handlePreloadPlaylist(force);
    }
  }

  prev() {
    if (!this.props.no_songs) {
      let total = this.props.playlist.results.length;
      let current = this.props.playlist.results.findIndex(song => song.id === this.props.active_song.id);
      let prev_id = current > 0 ? current - 1 : total - 1;
      let previous = this.props.playlist.results[prev_id];
      // checking if song is single in playlist and ignoring action
      if (total == 1) {
        return;
      } else {
        this.songEnded();
        this.props.playNext(previous);
      }
    }
  }

  handleScrollIntoView() {
    const current_url = this.props.history.location.pathname;
    const song_in_playlist_id = this.props.songs["results"].findIndex(song => song.id == this.props.active_song.id);
    if (song_in_playlist_id !== -1 && current_url === "/") {
      // it means that active song is in current playlist and we are on playlist page so we can scrollIntoView
      this.props.scrollToSong(this.props.active_song.id);
    } else {
      // showing warning instead
      if (this._notificationSystem) {
        this._notificationSystem.addNotification({
          message: "This song isn't visible or you aren't on playlist page",
          level: "warning",
          autoDismiss: 4,
          dismissible: "none",
        });
      }
    }
  }

  randomize() {
    this.props.orderingType == ordering_types.RANDOM
      ? this.props.orderSongByValue(ordering_types.UPLOADED_DATE)
      : this.props.orderSongByValue(ordering_types.RANDOM);
  }

  songEnded() {
    this._player.pause();
    this.props.setProgress(0);
  }

  togglePlay() {
    if (!this.props.no_songs) {
      this.props.setIsPlaying(!this.props.isPlaying);
    }
  }

  onPause() {
    // used when Safari uses pause from touchbar
    // here we need to ignore onEnded callback and props isLoading
    if (this.props.progress < 1 && !this.props.isLoading) {
      this.props.setIsPlaying(false);
    }
  }

  onPlay() {
    // used when Safari uses play from touchbar
    this.props.setIsPlaying(true);
  }

  onLoadedData() {
    this._player.currentTime = this._player.duration * this.props.progress; // setting progress from localStorage
  }

  toggleMute() {
    let is_muted = this.state.is_muted;
    let new_volume = is_muted ? this.state.volume : 0;
    this._player.volume = new_volume;
    this.setState({ is_muted: !this.state.is_muted });
  }

  listenProgress() {
    if (!this.props.isLoading) {
      this.props.setProgress(this._player.currentTime / this._player.duration);
    }
  }

  startSetProgress(evt, working = true) {
    if (!this.props.isLoading && working) {
      this.is_progress_mouse = false;
      this.setProgress(evt);
      this.setState({
        in_set_progress_mode: true,
      });
    }
  }

  setProgress(evt, working = true) {
    if (this.state.in_set_progress_mode && !this.props.no_songs && !this.props.isLoading && working) {
      let elem = evt.target;
      let clientX = null;
      try {
        // for touch devices
        clientX = evt.nativeEvent.changedTouches[0].clientX;
      } catch (e) {
        // fallback for non touch devices
        clientX = evt.clientX;
      }
      let progress = (clientX - offsetLeft(elem)) / elem.clientWidth;
      if (progress >= 1) {
        progress = 0.98; // hack to prevent reaching the end of the media to prevent firing onEnded
      } else if (progress <= 0) {
        progress = 0; // preventing from progress being negative because it will incorrectly display on FE
      }
      this._player.currentTime = this._player.duration * progress;
      this.props.setProgress(progress);
      this.is_progress_mouse = true;
    }
  }

  stopSetProgress(evt, force = false, working = true) {
    if (!this.props.isLoading && working) {
      if (!force && this.is_progress_mouse !== true) {
        this.setProgress(evt);
      }
      this.setState({
        in_set_progress_mode: false,
      });
    }
  }

  startSetVolume(evt) {
    this.setVolume(evt);
    this.setState({
      in_set_volume_mode: true,
    });
  }

  setVolume(evt) {
    if (this.state.in_set_volume_mode) {
      let elem = evt.target;
      let is_muted = this.state.is_muted;
      let new_volume = (evt.clientX - offsetLeft(elem)) / elem.clientWidth;
      if (new_volume <= 0.05) {
        new_volume = 0;
        is_muted = true;
      } else {
        is_muted = false;
      }
      this._player.volume = new_volume;
      this.setState({
        volume: new_volume,
        is_muted: is_muted,
      });
    }
  }

  listenWheelVolume(evt) {
    let new_volume = 0;
    let change_speed = 0.1;
    let is_muted = this.state.is_muted;
    let old_volume = this._player.volume;

    if (evt.deltaY > 0) {
      new_volume = old_volume - change_speed;
    } else {
      new_volume = old_volume + change_speed;
    }

    if (new_volume > 1) {
      new_volume = 1;
    } else if (1 >= new_volume && new_volume >= 0.05) {
      this._player.volume = new_volume;
      is_muted = false;
    } else {
      new_volume = 0;
      is_muted = true;
    }
    this._player.volume = new_volume;

    this.setState({
      volume: new_volume,
      is_muted: is_muted,
    });
  }

  stopSetVolume = (evt, force = false) => {
    if (!force) {
      this.setVolume(evt);
    }
    this.setState({
      in_set_volume_mode: false,
    });
  };

  repeat() {
    this.props.toggleRepeat(!this.props.is_repeat);
  }

  toggleRemainingTime() {
    this.setState({ is_remaining_time: !this.state.is_remaining_time });
  }

  render() {
    let songDuration = this._player ? this._player.duration : 0;
    let playerClsName = cx({
      fa: true,
      "fa-play-circle-o": !this.props.isPlaying && !this.props.isLoading,
      "fa-pause-circle-o": this.props.isPlaying && !this.props.isLoading,
      "fa-circle-o-notch fa-spin": this.props.isLoading,
    });
    let randomClass = cx({
      "control-button": true,
      active: this.props.orderingType == ordering_types.RANDOM,
    });
    let repeatClass = cx({
      "control-button": true,
      active: this.props.is_repeat,
    });
    let volumeClass = cx({
      fa: true,
      "fa-volume-up": !this.state.is_muted,
      "fa-volume-off": this.state.is_muted,
    });
    let progressBarSliderLeft = "0px"; // this is done to allow better user experience
    if (this.props.progress >= 0 && this.props.progress < 0.1 && this.state.is_touch) {
      progressBarSliderLeft = "6px"; // we are allowing slider to be slightly to the right (only touch devices)
    } else if (this.props.progress >= 0.978 && this.state.is_touch) {
      progressBarSliderLeft = "-2px"; // or to the left to allow user to better drag slider (only touch devices)
    }
    return (
      <footer styleName="player">
        <NotificationSystem ref={n => (this._notificationSystem = n)} />
        <div styleName="player__bar">
          <div styleName="player__bar__left">
            <div styleName="now-playing">
              <div styleName="cover-art shadow now-playing__cover-art">
                <div onClick={this.handleScrollIntoView.bind(this)}>
                  <img
                    styleName="cover-art-image cover-art-image-loaded"
                    src={this.props.active_song.small_image_thumbnail || "/static/img/song_default_small.png"}
                  />
                </div>
              </div>

              <div styleName="track-info ellipsis-one-line">
                <div styleName="track-info__name ellipsis-one-line">
                  <div styleName="track-info__name ellipsis-one-line">
                    <div styleName="react-contextmenu-wrapper">
                      {this.props.active_song.album ? (
                        <Link
                          to={`/artist/${this.props.active_song.artist.slug}/${this.props.active_song.album.slug}/`}
                          className="a-underlined"
                        >
                          {this.props.active_song.name}
                        </Link>
                      ) : (
                        <Link to={`/artist/${this.props.active_song.artist.slug}/`} className="a-underlined">
                          {this.props.active_song.name}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="link-subtle" styleName="track-info__artists ellipsis-one-line">
                  <span>
                    <span styleName="react-contextmenu-wrapper">
                      <Link to={`/artist/${this.props.active_song.artist.slug}/`} className="a-underlined">
                        {this.props.active_song.artist.name}
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
                  onClick={this.randomize.bind(this)}
                  className="fa fa-random"
                  styleName={randomClass}
                  title="Randomize"
                />
                <button
                  onClick={this.prev.bind(this)}
                  className="fa fa-backward"
                  styleName="control-button"
                  title="Previous"
                />
                <button
                  onClick={this.togglePlay.bind(this)}
                  className={playerClsName}
                  styleName="control-button control-button--circled"
                  title="Play"
                />
                <button
                  onClick={e => this.next(e, true)}
                  className="fa fa-forward"
                  styleName="control-button"
                  title="Next"
                />
                <button
                  onClick={this.repeat.bind(this)}
                  className="fa fa-repeat"
                  styleName={repeatClass}
                  title="Enable repeat"
                />
              </div>

              <div styleName="playback-bar">
                <div styleName="playback-bar__progress-time">{formatTime(this.props.progress * songDuration)}</div>
                <div
                  ref={ref => (this._progress_bar = ref)}
                  onTouchStart={e => this.startSetProgress(e, this.state.is_touch)}
                  onTouchMove={e => this.setProgress(e, this.state.is_touch)}
                  onTouchEnd={e => this.stopSetProgress(e, false, this.state.is_touch)}
                  onTouchCancel={e => this.stopSetProgress(e, false, this.state.is_touch)}
                  onMouseDown={e => this.startSetProgress(e, !this.state.is_touch)}
                  onMouseMove={e => this.setProgress(e, !this.state.is_touch)}
                  onMouseUp={e => this.stopSetProgress(e, false, !this.state.is_touch)}
                  styleName="progress-bar"
                >
                  <div styleName="middle-align progress-bar__bg">
                    <div
                      styleName="progress-bar__fg"
                      style={{
                        width: `${roundUp(this.props.progress * 100, 100)}%`,
                      }}
                    />
                    <div
                      styleName="middle-align progress-bar__slider"
                      style={{
                        left: `calc(${progressBarSliderLeft} + ${roundUp(this.props.progress * 100, 100)}%)`,
                      }}
                    />
                  </div>
                </div>
                <div styleName="playback-bar__progress-time" onClick={this.toggleRemainingTime.bind(this)}>
                  {!this.state.is_remaining_time
                    ? formatTime(this.props.active_song.length)
                    : `- ${formatTime(this.props.active_song.length - this.props.progress * songDuration)}`}
                </div>
              </div>
            </div>
          </div>

          <audio
            ref={ref => (this._player = ref)}
            onEnded={() => this.next()}
            onCanPlayThrough={this.onCanPlay.bind(this)}
            onTimeUpdate={this.listenProgress.bind(this)}
            onPause={this.onPause.bind(this)}
            onPlay={this.onPlay.bind(this)}
            onLoadedData={this.onLoadedData.bind(this)}
            autoPlay={false}
            preload="none"
          >
            <source src={this.props.active_song.audio_file} type="audio/mp3" />
          </audio>

          <div styleName="player__bar__right">
            <div styleName="now-playing-bar__right__inner">
              <div styleName="extra-controls">
                <span styleName="connect-device-picker" style={{ display: "none" }}>
                  <button className="fa fa-heart" styleName="control-button" />
                </span>

                <div onWheel={this.listenWheelVolume.bind(this)} styleName="volume-bar">
                  <button
                    onClick={this.toggleMute.bind(this)}
                    className={volumeClass}
                    styleName="control-button volume-bar__icon"
                  />

                  <div
                    onMouseDown={this.startSetVolume.bind(this)}
                    onMouseMove={this.setVolume.bind(this)}
                    onMouseUp={this.stopSetVolume}
                    styleName="progress-bar"
                  >
                    <div styleName="middle-align progress-bar__bg">
                      <div
                        styleName="progress-bar__fg"
                        style={{
                          width: this.state.is_muted > 0 ? 0 : `${roundUp(this.state.volume * 100, 100)}%`,
                        }}
                      />
                      <div
                        styleName="middle-align progress-bar__slider"
                        style={{
                          left: this.state.is_muted > 0 ? 0 : `${roundUp(this.state.volume * 100, 100)}%`,
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

Player.propTypes = {
  playlist: PropTypes.object,
  song: PropTypes.object,
};

export default CSSModules(Player, styles, { allowMultiple: true });
