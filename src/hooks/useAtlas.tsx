// useAtlas.js
import React, {
  useEffect,
  useRef,
  useReducer,
  Reducer,
  useCallback,
} from 'react';
import atlasReducer from '../reducer/reducer';
import {
  initialState,
  defaultAdministrativeRegionObject,
} from '../reducer/reducer';

import {
  setIsMobile,
  setIsClustered,
  setLegendSize,
  setMap,
  setIsOpenAtlasMapInterface,
  setIsLocationSelectMode,
  setActiveLocationSelection,
  setNominatim,
  setActiveGeographicIdentifier,
  setActiveAdministrativeRegion,
  setAdministrativeRegionClickHistoryArray,
  initAtlas,
} from '../reducer/actions';

import { Layer, LatLngExpression, latLngBounds, Path, Polyline } from 'leaflet';

import {
  AtlasState,
  AtlasAction,
  AtlasInterfaceProps,
  GeographicIdentifier,
  LocationSelection,
  AdministrativeRegionObject,
} from '../types/atlas.types';

import geojsonData from '../assets/geojson/administrative_regions_extended.json';
const administrativeRegionsData = geojsonData as FeatureCollection;

import { useNavigate } from '@tanstack/react-router';

import { FeatureCollection } from 'geojson';

function useAtlas(Route): AtlasInterfaceProps {
  // Routing
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const navGeographicIdentifier = Object.keys(search);
  const navGeographicIdentifierValue = Object.values(search);

  const navAdministrativeRegion = search['id']
    ? getAdministrativeRegionObject('id', search['id'])
    : getAdministrativeRegionObject(
        navGeographicIdentifier[0] as GeographicIdentifier,
        navGeographicIdentifierValue[0] as string | number,
      );

  // const navBounds = search['bounds'];

  const sideBarRef = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useReducer<Reducer<AtlasState, AtlasAction>>(
    atlasReducer,
    {
      ...initialState,
      activeAdministrativeRegion: navAdministrativeRegion,
      activeGeographicIdentifier:
        navGeographicIdentifier[0] as GeographicIdentifier,
    },
  );

  const {
    isMobile,
    legendSize,
    isClustered,
    map,
    isOpenAtlasMapInterface,
    isLocationSelectMode,
    activeLocationSelection,
    nominatim,
    activeGeographicIdentifier,
    activeAdministrativeRegion,
    administrativeRegionClickHistoryArray,
  } = state;

  /*
  useEffects
  */

  console.count('useAtlas');

  useEffect(() => {
    // console.log(navBounds, 'navBounds');
    updateMap();
    // if (map && navBounds)
    //   map?.flyToBounds([
    //     [navBounds[0], navBounds[1]],
    //     [navBounds[2], navBounds[3]],
    //   ]);
  });

  useEffect(() => {
    if (isMobile && activeAdministrativeRegion?.country == 'country') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
    if (isMobile && activeAdministrativeRegion?.country !== 'country') {
      window.scrollTo({
        top: (document.getElementById('legend')?.offsetTop ?? 0) * 1.312,
        behavior: 'smooth',
      });
    }
  }, [activeAdministrativeRegion]);

  useEffect(() => {
    if (isMobile) {
      dispatch(setIsOpenAtlasMapInterface(false));
    }
    // if (sideBarRef.current) sideBarRef.current.scrollTop = 0;
    if (sideBarRef.current)
      sideBarRef.current.scrollTo({
        top: document.getElementById('atlas-tabs')?.offsetTop,
        behavior: 'smooth',
      });

    const selection: LocationSelection = {
      activeSelection: activeAdministrativeRegion[activeGeographicIdentifier],
      activeGeographicIdentifier,
      activeAdministrativeRegion,
    };
    dispatch(
      setAdministrativeRegionClickHistoryArray([
        selection,
        ...administrativeRegionClickHistoryArray,
      ]),
    );
    if (isLocationSelectMode) {
      dispatch(
        setAdministrativeRegionClickHistoryArray([
          selection,
          ...activeLocationSelection,
        ]),
      );
    }
    updateMap();
  }, [activeAdministrativeRegion, activeGeographicIdentifier, nominatim]);

  const style_locationMuted = {
    color: 'var(--surface-atlas-disabled)',
    fillOpacity: 0.161,
    weight: 0.161,
  };

  const style_activeLocationHighlight = {
    color: 'var(--surface-atlas-info)',
    fillOpacity: 0.161,
    weight: 0.161,
  };

  const style_locationNameHighlight = {
    color: 'var(--surface-atlas-info)',
    fillOpacity: 0.161,
    weight: 1.312,
  };

  //  FUNCTIONS

  // Handle resize
  const handleResize = () => {
    setTimeout(() => map && map.invalidateSize(), 300);
    dispatch(setIsMobile(window.innerWidth < 768));
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle random
  function handleRandom() {
    const random = Math.floor(
      administrativeRegionsData?.features.length * Math.random(),
    );

    const randomAdministrativeRegion = administrativeRegionsData?.features[
      random
    ].properties as AdministrativeRegionObject;

    dispatch(setActiveAdministrativeRegion(randomAdministrativeRegion));

    navigate({
      // @ts-expect-error it works
      search: () => ({
        [activeGeographicIdentifier]:
          randomAdministrativeRegion[activeGeographicIdentifier],
        // bounds: administrativeRegionArray.toBBoxString(),
        id: randomAdministrativeRegion?.id,
      }),
    }).then(() => location.reload());
  }

  //  Update Map
  function updateMap() {
    // Initialize Empty LatLngBounds to keep extending
    const administrativeRegionArray = latLngBounds(
      null as unknown as LatLngExpression,
      null as unknown as LatLngExpression,
    );

    // Check if region needs an update
    if (
      activeAdministrativeRegion?.country !== 'country' ||
      nominatim?.features[0]
    ) {
      const isNameMatch = (region, name) =>
        region.feature?.properties.name === name;
      const isCountryMatch = (region, country) =>
        region.feature?.properties.country === country;
      const isTypeMatch = (region, type, value) =>
        region.feature?.properties[type] === value;

      // Updates Map View on Location Type or Region Change
      map?.eachLayer((region: Layer) => {
        if (activeGeographicIdentifier === 'name') {
          if (
            !isNameMatch(region, nominatim?.features[0]?.properties.name) &&
            isNameMatch(region, activeAdministrativeRegion?.name)
          ) {
            administrativeRegionArray.extend((region as Polyline).getBounds());
          }
        } else if (
          isCountryMatch(region, activeAdministrativeRegion?.country)
        ) {
          administrativeRegionArray.extend((region as Polyline).getBounds());
        }
      });

      // Highlight and Get Bounds
      map?.eachLayer((region: Layer) => {
        if (typeof (region as Path).setStyle === 'function' && !nominatim) {
          (region as Path).setStyle(style_locationMuted); // Mute all regions
        }

        if (
          typeof (region as Path).setStyle === 'function' &&
          isTypeMatch(
            region,
            activeGeographicIdentifier,
            activeAdministrativeRegion[activeGeographicIdentifier],
          )
        ) {
          (region as Path).setStyle(style_locationNameHighlight); // Highlight active location
        }

        if (
          typeof (region as Path).setStyle === 'function' &&
          isCountryMatch(region, activeAdministrativeRegion?.country)
        ) {
          (region as Path).setStyle(style_activeLocationHighlight); // Highlight country match
          if (
            isNameMatch(region, activeAdministrativeRegion?.name) &&
            !nominatim
          ) {
            (region as Path).setStyle(style_locationNameHighlight); // Highlight name match
          }
        }

        if (
          typeof (region as Path).setStyle === 'function' &&
          !isNameMatch(region, nominatim?.features[0]?.properties.name) &&
          isTypeMatch(
            region,
            activeGeographicIdentifier,
            activeAdministrativeRegion[activeGeographicIdentifier],
          )
        ) {
          administrativeRegionArray.extend((region as Polyline).getBounds()); // Extend bounds for matched regions
        }
      });

      // Refreshes Map after initial region selection
      setTimeout(() => map?.invalidateSize(), 300);

      if (Object.keys(administrativeRegionArray).length !== 0) {
        map?.fitBounds(administrativeRegionArray);

        navigate({
          // @ts-expect-error it works
          search: () => ({
            [activeGeographicIdentifier]:
              activeAdministrativeRegion[activeGeographicIdentifier],
            // bounds: administrativeRegionArray.toBBoxString(),
            id: activeAdministrativeRegion?.id,
          }),
        });
      }
    }
  }

  // resetAtlas function
  function resetAtlas() {
    dispatch(initAtlas(initialState));
    navigate({ to: '/', search });
    if (sideBarRef.current)
      sideBarRef.current.scrollTo({
        top: document.getElementById('atlas-tabs')?.offsetTop,
        behavior: 'smooth',
      });
  }

  const setLegendSizeCallback = useCallback(
    (legendSize) => dispatch(setLegendSize(legendSize)),
    [dispatch],
  );

  const setIsClusteredCallback = useCallback(
    (isClustered) => dispatch(setIsClustered(isClustered)),
    [dispatch],
  );

  const setMapCallback = useCallback(
    (map) => dispatch(setMap(map)),
    [dispatch],
  );

  const setIsOpenAtlasMapInterfaceCallback = useCallback(
    (isOpenAtlasMapInterface) =>
      dispatch(setIsOpenAtlasMapInterface(isOpenAtlasMapInterface)),
    [dispatch],
  );

  const setIsLocationSelectModeCallback = useCallback(
    (isLocationSelectMode) =>
      dispatch(setIsLocationSelectMode(isLocationSelectMode)),
    [dispatch],
  );

  const setActiveLocationSelectionCallback = useCallback(
    (activeLocationSelection) =>
      dispatch(setActiveLocationSelection(activeLocationSelection)),
    [dispatch],
  );

  const setNominatimCallback = useCallback(
    (nominatim) => dispatch(setNominatim(nominatim)),
    [dispatch],
  );

  const setActiveGeographicIdentifierCallback = useCallback(
    (activeGeographicIdentifier) =>
      dispatch(setActiveGeographicIdentifier(activeGeographicIdentifier)),
    [dispatch],
  );

  const setActiveAdministrativeRegionCallback = useCallback(
    (activeAdministrativeRegion) =>
      dispatch(setActiveAdministrativeRegion(activeAdministrativeRegion)),
    [dispatch],
  );

  const setAdministrativeRegionClickHistoryArrayCallback = useCallback(
    (administrativeRegionClickHistoryArray) =>
      dispatch(
        setAdministrativeRegionClickHistoryArray(
          administrativeRegionClickHistoryArray,
        ),
      ),
    [dispatch],
  );

  return {
    isMobile,
    resetAtlas,
    sideBarRef,
    legendSize,
    setLegendSize: setLegendSizeCallback,
    isClustered,
    setIsClustered: setIsClusteredCallback,
    map,
    setMap: setMapCallback,
    isOpenAtlasMapInterface,
    setIsOpenAtlasMapInterface: setIsOpenAtlasMapInterfaceCallback,
    isLocationSelectMode,
    setIsLocationSelectMode: setIsLocationSelectModeCallback,
    activeLocationSelection,
    setActiveLocationSelection: setActiveLocationSelectionCallback,
    nominatim,
    setNominatim: setNominatimCallback,
    activeGeographicIdentifier,
    setActiveGeographicIdentifier: setActiveGeographicIdentifierCallback,
    activeAdministrativeRegion,
    setActiveAdministrativeRegion: setActiveAdministrativeRegionCallback,
    administrativeRegionClickHistoryArray,
    setAdministrativeRegionClickHistoryArray:
      setAdministrativeRegionClickHistoryArrayCallback,
    handleRandom,
  };
}
export default useAtlas;

// getAdministrativeRegionObject

export function getAdministrativeRegionObject(
  GeographicIdentifier: GeographicIdentifier,
  value: string | number,
) {
  if (GeographicIdentifier && value === 'country')
    return defaultAdministrativeRegionObject;

  const { features: administrativeRegionsData } =
    geojsonData as FeatureCollection;

  const match = administrativeRegionsData.find((administrativeRegionData) => {
    if (administrativeRegionData.properties)
      return (
        value === administrativeRegionData.properties[GeographicIdentifier]
      );
  });

  if (match === undefined) return defaultAdministrativeRegionObject;
  return match?.properties as AdministrativeRegionObject;
}
