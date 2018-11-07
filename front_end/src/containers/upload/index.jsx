import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Request from 'superagent';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import NotificationSystem from 'react-notification-system';
import CSSModules from 'react-css-modules';

import { roundUp, getCookie } from 'utils/misc';
import {
  setSongs, setNoSongs, initialLoadSongs, mergeNextArtists, setArtists,
} from 'actions';

import styles from './upload.css';

const cx = classNames.bind(styles);

class Upload extends Component {
  constructor() {
    super();
    this.state = {
      disabled: true, // controls disabled/enabled send button
      sending: false, // controls if we are sending to server
      accepted: [],
      percentage: 0,
    };
    this.notificationSystem = null;
    this.files_sent = 0;
    this.counter = 0;
  }

  setProgress(e) {
    const { accepted } = this.state;
    const combinedPercent = (e.percent + 100 * this.files_sent) / accepted.length;
    const rawPercent = roundUp(combinedPercent, 2);
    this.setState({ percentage: rawPercent });
  }

  drop = (acceptedInpt) => {
    const { accepted } = this.state;
    if (acceptedInpt.length > 0) {
      const newAccepted = accepted.concat(acceptedInpt);
      this.setState({
        accepted: newAccepted,
        disabled: false,
      });
    }
  }

  addNotification(message, level) {
    if (this.notificationSystem) {
      this.notificationSystem.addNotification({
        message,
        level,
      });
    }
  }

  uploadFile() {
    const { accepted } = this.state;
    const {
      noSongs, setNoSongs, initialLoadSongs, searchSongValue, filterTagValue,
      setSongs, songs, setArtists, mergeNextArtists,
    } = this.props;
    const req = Request.post('/api/v0/audio/');
    const csrftoken = getCookie('csrftoken');
    req.attach('audio_file', accepted[this.counter]);
    this.counter += 1;
    req.set('X-CSRFToken', csrftoken);
    req.on('progress', this.setProgress.bind(this));
    req.end((err, data) => {
      this.files_sent += 1;
      if (!err) {
        if (noSongs) {
          setNoSongs(false);
          initialLoadSongs();
        }
        if (!searchSongValue) {
          if (filterTagValue && data.body.tags.includes(filterTagValue.id)) {
            // checking if we uploaded song matches to filtered tag
            const newSongsObject = { ...songs };
            newSongsObject.results.unshift(data.body);
            setSongs(newSongsObject);
          } else if (!filterTagValue) {
            const newSongsObject = { ...songs };
            newSongsObject.results.unshift(data.body);
            setSongs(newSongsObject);
          }
        }
        this.addNotification(`Uploaded: ${data.body.artist.name} - ${data.body.name}`, 'success');
      } else if (err && err.status === 403) {
        this.addNotification(data.body.detail, 'error');
      } else if (err && err.status === 400) {
        this.addNotification(data.body.non_field_errors, 'error');
      } else {
        this.addNotification('Server error, contact admin plz', 'error');
      }

      if (this.counter < accepted.length) {
        this.uploadFile();
      } else {
        this.setState({ accepted: [], sending: false, percentage: 0 });
        this.files_sent = 0;
        this.counter = 0;
        // resetting artist and parsing them again
        setArtists({
          count: null,
          next: null,
          previous: null,
          results: [],
        });
        mergeNextArtists();
      }
    });
  }

  send() {
    this.setState({ sending: true, disabled: true });
    this.uploadFile(); // initiating first file upload
  }

  render() {
    const {
      sending, accepted, disabled, percentage,
    } = this.state;
    const sendButtonCls = cx({
      btn: true,
      'btn--success': true,
    });
    const loadingCls = cx({
      'fa fa-refresh fa-pulse fa-fw': sending,
    });
    const dropZoneCls = cx({
      dropzone: true,
      'dropzone--disabled': sending,
    });
    return (
      <div className="app__container">
        <NotificationSystem ref={(n) => { this.notificationSystem = n; }} />

        <div styleName={dropZoneCls}>
          <Dropzone
            style={{}}
            disabled={sending}
            disablePreview
            maxSize={1024 * 1024 * 200}
            accept="audio/mp3, audio/mpeg"
            onDrop={this.drop}
          >
            <p>Try dropping some files here, or click to select files to upload.</p>
            <p>Only *.mp3 files will be accepted</p>
          </Dropzone>
        </div>
        <div>
          <p
            styleName="dropzone__upload-text"
            style={{
              visibility: accepted.length && !sending ? 'visible' : 'hidden',
            }}
          >
            you&#39;ve selected
            {` ${accepted.length} `}
            {accepted.length === 1 ? 'file' : 'files'}
          </p>
          {!sending && (
            <div styleName="button__cotainer">
              <button type="submit" disabled={disabled} className={sendButtonCls} onClick={this.send.bind(this)}>
                <i className={loadingCls} />
                Send files
              </button>
            </div>
          )}
          {sending && (
            <div>
              <div styleName="seconds">
                <div id="bar" style={{ width: `${percentage}%` }} styleName="bar" />
              </div>
              <h3 className="default-center m-3vh">Uploading ...</h3>
            </div>
          )}
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setSongs,
      setNoSongs,
      initialLoadSongs,
      mergeNextArtists,
      setArtists,
    },
    dispatch,
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CSSModules(Upload, styles, { allowMultiple: true }));
