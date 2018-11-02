import toggleMenu from './menu';
import {
  setPlaylist, togglePlayNextItem, mergeNextPlaylist, scrollToSong,
} from './playlist';
import {
  setIsPlaying, playNext, emitIsLoading, toggleRepeat, setProgress,
} from './player';
import {
  mergeNextArtists, searchArtists, setSearchArtistValue, setArtists,
} from './artist';
import {
  initialLoadSongs, setSongs, mergeNextSongs, setNoSongs,
  orderSongByValue, filterSongByTag, searchSong, setSearchSongValue,
} from './song';

export {
  playNext,
  setSongs,
  toggleMenu,
  searchSong,
  setNoSongs,
  setArtists,
  setProgress,
  setPlaylist,
  setIsPlaying,
  scrollToSong,
  toggleRepeat,
  searchArtists,
  emitIsLoading,
  mergeNextSongs,
  filterSongByTag,
  orderSongByValue,
  mergeNextArtists,
  initialLoadSongs,
  mergeNextPlaylist,
  togglePlayNextItem,
  setSearchSongValue,
  setSearchArtistValue,
};
