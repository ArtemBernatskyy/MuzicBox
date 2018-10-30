import { combineReducers } from 'redux';

import isMenuOpen from './menu';
import {
  songs, activeSong, noSongs, searchSongValue, filterTagValue,
  orderingType, isAuthorSearch, isSearchSongLoading,
} from './song';
import {
  isPlaying, isLoading, isRepeat, progress,
} from './player';
import { playlist, scrollIntoViewSong, playNextList } from './playlist';
import { artists, searchArtistValue, isSearchArtistLoading } from './artist';

const rootReducer = combineReducers({
  songs,
  noSongs,
  artists,
  progress,
  playlist,
  isRepeat,
  isPlaying,
  isLoading,
  activeSong,
  isMenuOpen,
  playNextList,
  orderingType,
  isAuthorSearch,
  filterTagValue,
  searchSongValue,
  searchArtistValue,
  scrollIntoViewSong,
  isSearchSongLoading,
  isSearchArtistLoading,
});

export default rootReducer;
