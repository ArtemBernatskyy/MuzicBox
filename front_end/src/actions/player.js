import * as types from './action_types';

export const emitIsPlaying = bool => ({
  type: types.SET_IS_PLAYING,
  payload: bool,
});

export const loadSongDetailsSuccess = song => ({
  type: types.PLAY_NEXT,
  payload: song,
});

export const emitIsLoading = bool => ({
  type: types.SET_IS_LOADING,
  payload: bool,
});

export const toggleRepeat = bool => ({
  type: types.TOGGLE_REPEAT,
  payload: bool,
});

export const setProgress = unitInterval => ({
  type: types.SET_PROGRESS,
  payload: unitInterval,
});

export function setIsPlaying(isPlaying) {
  return (dispatch, getState) => {
    const { isLoading } = getState();
    // not playing if we are loading
    if (!isLoading) {
      dispatch(emitIsPlaying(isPlaying));
    }
  };
}

export function playNext(songObject, playing = false) {
  return (dispatch) => {
    dispatch(emitIsLoading(true));
    dispatch(loadSongDetailsSuccess(songObject));
    if (playing) {
      dispatch(emitIsPlaying(true));
    }
  };
}
