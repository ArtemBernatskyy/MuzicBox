import { handleErrors } from 'utils/misc';

class ArtistApi {
  static getNextArtists(pageUrl) {
    let fetchUrl;
    if (pageUrl) {
      fetchUrl = pageUrl;
    } else {
      fetchUrl = '/api/v0/artists/';
    }
    return fetch(fetchUrl, { cache: 'no-cache', credentials: 'same-origin' })
      .then(response => response.json())
      .catch((error) => {
        throw error;
      });
  }

  static searchArtist(artistName) {
    return fetch(`/api/v0/artists/?search=${artistName}`, {
      cache: 'no-cache',
      credentials: 'same-origin',
    })
      .then(response => response.json())
      .catch((error) => {
        throw error;
      });
  }

  static getArtist(artistSlug) {
    return fetch(`/api/v0/artists/${artistSlug}/`, {
      cache: 'no-cache',
      credentials: 'same-origin',
    })
      .then(handleErrors)
      .then(response => response.json())
      .catch((error) => {
        throw error;
      });
  }
}

export default ArtistApi;
