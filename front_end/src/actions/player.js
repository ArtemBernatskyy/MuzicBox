import * as types from "./action_types";
import { loadSongDetailsSuccess } from "./song";

export const emitIsPlaying = bool => {
  return {
    type: types.SET_IS_PLAYING,
    payload: bool,
  };
};

export function setIsPlaying(is_playing) {
  return dispatch => {
    dispatch(emitIsPlaying(is_playing));
  };
}

export function playNext(song_object, playing = false) {
  return dispatch => {
    dispatch(loadSongDetailsSuccess(song_object));
    if (playing) {
      dispatch(emitIsPlaying(true));
    }
  };
}
