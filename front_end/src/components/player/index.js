import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import {
  playNext,
  setIsPlaying,
  setPlaylist,
  mergeNextPlaylist,
  togglePlayNextItem,
  orderSongByValue,
  scrollToSong,
  emitIsLoading,
  toggleRepeat,
  setProgress,
} from "actions";
import Player from "./player";

function mapStateToProps(state) {
  return {
    active_song: state.active_song,
    is_playing: state.is_playing,
    playlist: state.playlist,
    songs: state.songs,
    no_songs: state.no_songs,
    play_next_list: state.play_next_list,
    ordering_type: state.ordering_type,
    is_loading: state.is_loading,
    is_repeat: state.is_repeat,
    progress: state.progress,
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      playNext,
      setIsPlaying,
      setPlaylist,
      mergeNextPlaylist,
      togglePlayNextItem,
      orderSongByValue,
      scrollToSong,
      emitIsLoading,
      toggleRepeat,
      setProgress,
    },
    dispatch
  );
}

export default withRouter(
  connect(
    mapStateToProps,
    matchDispatchToProps
  )(Player)
);
