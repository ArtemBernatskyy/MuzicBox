import toggleMenu from './menu';
import {
  setPlaylist,
  togglePlayNextItem,
  mergeNextPlaylist,
  scrollToSong,
} from './playlist';
import {
  setIsPlaying, playNext, emitIsLoading, toggleRepeat, setProgress,
} from './player';
import {
  initialLoadSongs, setSongs, mergeNextSongs, noSongs,
  orderSongByValue, filterSongByTag, searchSong, setSearchSongValue,
} from './song';
import {
  mergeNextArtists, searchArtists, setSearchArtistValue, setArtists,
} from './artist';

export {
  initialLoadSongs,
  setSongs,
  setIsPlaying,
  playNext,
  toggleMenu,
  searchSong,
  togglePlayNextItem,
  setPlaylist,
  setSearchSongValue,
  mergeNextArtists,
  mergeNextPlaylist,
  mergeNextSongs,
  searchArtists,
  setSearchArtistValue,
  filterSongByTag,
  noSongs,
  setArtists,
  orderSongByValue,
  scrollToSong,
  emitIsLoading,
  toggleRepeat,
  setProgress,
};
