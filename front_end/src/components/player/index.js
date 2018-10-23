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
    isPlaying: state.isPlaying,
    playlist: state.playlist,
    songs: state.songs,
    noSongs: state.noSongs,
    play_next_list: state.play_next_list,
    orderingType: state.orderingType,
    isLoading: state.isLoading,
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
