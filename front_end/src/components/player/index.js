import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  playNext,
  setIsPlaying,
  setPlaylist,
  mergeNextPlaylist,
  togglePlayNextItem,
  orderSongByValue,
  scrollToSong,
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
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(Player);
