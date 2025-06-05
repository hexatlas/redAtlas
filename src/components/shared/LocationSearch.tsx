import React, { useContext } from 'react';

import { AtlasContext } from '../../routes/__root';
import useNominatim from '../../data/shared/useNominatim';

function AtlasLocationSearch() {
  const {
    // Util
    resetAtlas,

    // Location
    map,
    setIsOpenAtlasMapInterface,
    setNominatim,

    handleRandom,
    setActiveGeographicIdentifier,

    activeAdministrativeRegion,
    setActiveAdministrativeRegion,
  } = useContext(AtlasContext)!;

  const { handleSearchInputChange, handleCLickSearchResult, searchTerm, searchResults, loading } =
    useNominatim(
      setActiveGeographicIdentifier,
      activeAdministrativeRegion,
      setActiveAdministrativeRegion,
      setNominatim,
      setIsOpenAtlasMapInterface,
      map,
    );

  const { country } = activeAdministrativeRegion;

  return (
    <>
      <div className="wrapper" aria-label="Location Search">
        <form role="search" aria-label="Search Location Form">
          <label htmlFor="search-input" className="sr-only">
            Search Location in {country}
          </label>
          <input
            className="search-input"
            type="search"
            placeholder={`Search Location ${country !== 'country' ? `in ${country}` : ''}`}
            aria-label={`Search Location ${country !== 'country' ? `in ${country}` : ''}`}
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
        </form>{' '}
        {activeAdministrativeRegion?.country === 'country' && (
          <button
            role="button"
            title="Select Random Administrative Region"
            aria-label="Random Button - Select Random Administrative Region"
            className="action"
            onClick={handleRandom}
          >
            🎲
          </button>
        )}
        {country !== 'country' && (
          <button
            role="button"
            title="Reset Atlas to default settings"
            aria-label="Reset Atlas"
            className="atlas-reset-button"
            onClick={resetAtlas}
          >
            {activeAdministrativeRegion['emoji']} ⨯
          </button>
        )}
      </div>
      {searchTerm.trim() !== '' && (
        <ul className="search-results light" aria-label="Search Results">
          {loading && <p className="map-info__loading-emoji">🔍</p>}
          {searchResults.map((result) => (
            <li key={result.place_id}>
              <button
                onClick={() => handleCLickSearchResult(result)}
                role="button"
                aria-label={`Select ${result.display_name}`}
              >
                {result.display_name}
              </button>
            </li>
          ))}
          {!loading && searchResults.length >= 0 && <p>🪹</p>}
          <small className="search-licence">{searchResults[0]?.licence}</small>
        </ul>
      )}
    </>
  );
}

export default AtlasLocationSearch;
