import React from 'react';

import { AtlasInterfaceProps } from '../../types/atlas.types';
import AtlasLocationSearch from '../shared/LocationSearch';
import AtlasGeographyOptions from '../shared/GeographyOptions';
import CurrentUTC from '../shared/CurrentUTC';
import LocalWeather from '../shared/LocalWeather';
// import LocalWeather from '../shared/LocalWeather';

function AtlasInterface({ isMobile }: AtlasInterfaceProps) {
  /* 
    Handlers
 */

  // const handleLocationSelection = () => {
  //   resetAtlas();
  //   setIsOpenAtlasMapInterface(true);
  //   setIsLocationSelectMode(!isLocationSelectMode);
  // };

  return (
    <div className="map-interface map-interface__mobile">
      {!isMobile && (
        <>
          {/* <button
            role="button"
            title="Select Locations"
            aria-label="Click to Select Locations"
            className="settings"
            onMouseDown={handleLocationSelection}
          >
            🖊️
          </button> */}
        </>
      )}
      <small className="mute">
        <CurrentUTC />
        <LocalWeather />
      </small>
      <AtlasLocationSearch />
      <AtlasGeographyOptions />
    </div>
  );
}

export default React.memo(AtlasInterface);
