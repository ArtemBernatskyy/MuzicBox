import React, { Component } from "react";
import Dropzone from "react-dropzone";
import Request from "superagent";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import classNames from "classnames";
import NotificationSystem from "react-notification-system";
import CSSModules from "react-css-modules";

import { roundUp } from "utils/misc";
import { setSongs, setNoSongs, initialLoadSongs, mergeNextArtists, setArtists } from "actions";

import styles from "./upload.css";

let cx = classNames.bind(styles);

class Upload extends Component {
  constructor() {
    super();
    this.state = {
      disabled: true, // controls disabled/enabled send button
      sending: false, // controls if we are sending to server
      accepted: [],
      rejected: [],
      percentage: 0,
    };
    this.notificationSystem = null;
    this.files_sent = 0;
    this.counter = 0;
  }

  _addNotification(message, level) {
    if (this.notificationSystem) {
      this.notificationSystem.addNotification({
        message: message,
        level: level,
      });
    }
  }

  getCookie(name) {
    let match = document.cookie.match(new RegExp(name + "=([^;]+)"));
    if (match) return match[1];
  }

  drop(accepted, rejected) {
    if (accepted.length > 0) {
      let new_accepted = this.state.accepted.concat(accepted);
      this.setState({
        accepted: new_accepted,
        rejected: rejected,
        disabled: false,
      });
    }
  }

  setProgress(e) {
    let combined_percent = (e.percent + 100 * this.files_sent) / this.state.accepted.length;
    let raw_percent = roundUp(combined_percent, 2);
    this.setState({ percentage: raw_percent });
  }

  uploadFile() {
    const req = Request.post("/api/v0/audio/");
    let csrftoken = this.getCookie("csrftoken");
    req.attach("audio_file", this.state.accepted[this.counter]);
    this.counter++;
    req.set("X-CSRFToken", csrftoken);
    req.on("progress", this.setProgress.bind(this));
    req.end((err, data) => {
      this.files_sent += 1;
      if (!err) {
        if (this.props.noSongs) {
          this.props.setNoSongs(false);
          this.props.initialLoadSongs();
        }
        if (!this.props.searchSongValue) {
          if (this.props.filterTagValue && data.body.tags.includes(this.props.filterTagValue.id)) {
            // checking if we uploaded song matches to filtered tag
            let new_songs_object = { ...this.props.songs };
            new_songs_object.results.unshift(data.body);
            this.props.setSongs(new_songs_object);
          } else if (!this.props.filterTagValue) {
            let new_songs_object = { ...this.props.songs };
            new_songs_object.results.unshift(data.body);
            this.props.setSongs(new_songs_object);
          }
        }
        this._addNotification(`Uploaded: ${data.body["artist"]["name"]} - ${data.body["name"]}`, "success");
      } else if (err && err.status === 403) {
        this._addNotification(data.body["detail"], "error");
      } else if (err && err.status === 400) {
        this._addNotification(data.body["non_field_errors"], "error");
      } else {
        this._addNotification("Server error, contact admin plz", "error");
      }

      if (this.counter < this.state.accepted.length) {
        this.uploadFile();
      } else {
        this.setState({ accepted: [], sending: false, percentage: 0 });
        this.files_sent = 0;
        this.counter = 0;
        // resetting artist and parsing them again
        this.props.setArtists({
          count: null,
          next: null,
          previous: null,
          results: [],
        });
        this.props.mergeNextArtists();
      }
    });
  }

  send() {
    this.setState({ sending: true, disabled: true });
    this.uploadFile(); // initiating first file upload
  }

  render() {
    let sendButtonCls = cx({
      btn: true,
      "btn--success": true,
    });
    let loadingCls = cx({
      "fa fa-refresh fa-pulse fa-fw": this.state.sending,
    });
    let dropZoneCls = cx({
      dropzone: true,
      "dropzone--disabled": this.state.sending,
    });
    return (
      <div className="app__container">
        <NotificationSystem ref={n => (this.notificationSystem = n)} />

        <div styleName={dropZoneCls}>
          <Dropzone
            style={{}}
            disabled={this.state.sending}
            disablePreview={true}
            maxSize={1024 * 1024 * 200}
            accept="audio/mp3, audio/mpeg"
            onDrop={this.drop.bind(this)}
          >
            <p>Try dropping some files here, or click to select files to upload.</p>
            <p>Only *.mp3 files will be accepted</p>
          </Dropzone>
        </div>
        <div>
          <p
            styleName="dropzone__upload-text"
            style={{
              visibility: this.state.accepted.length && !this.state.sending ? "visible" : "hidden",
            }}
          >
            you&#39;ve selected {this.state.accepted.length} {this.state.accepted.length === 1 ? "file" : "files"}
          </p>
          {!this.state.sending ? (
            <div styleName="button__cotainer">
              <button disabled={this.state.disabled} className={sendButtonCls} onClick={this.send.bind(this)}>
                <i className={loadingCls} />
                Send files
              </button>
            </div>
          ) : null}
          {this.state.sending ? (
            <div>
              <div styleName="seconds">
                <div id="bar" style={{ width: `${this.state.percentage}%` }} styleName="bar" />
              </div>
              <h3 className="default-center m-3vh">Uploading ...</h3>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    songs: state.songs,
    filterTagValue: state.filterTagValue,
    searchSongValue: state.searchSongValue,
    noSongs: state.noSongs,
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setSongs,
      setNoSongs,
      initialLoadSongs,
      mergeNextArtists,
      setArtists,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(CSSModules(Upload, styles, { allowMultiple: true }));
