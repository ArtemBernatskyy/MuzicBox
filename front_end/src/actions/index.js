import toggleMenu from './menu';
import { setIsStorageSync, handleLogin, handleLogout } from './system';
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
  handleLogin,
  setIsPlaying,
  handleLogout,
  scrollToSong,
  toggleRepeat,
  searchArtists,
  emitIsLoading,
  mergeNextSongs,
  filterSongByTag,
  orderSongByValue,
  mergeNextArtists,
  initialLoadSongs,
  setIsStorageSync,
  mergeNextPlaylist,
  togglePlayNextItem,
  setSearchSongValue,
  setSearchArtistValue,
};
