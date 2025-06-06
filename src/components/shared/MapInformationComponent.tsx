import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AtlasContext } from '../../routes/__root';
import useOverpassLayer from '../../data/shared/useOverpassLayer';

import LegendLayout from './LegendLayout';
import AtlasOSMSettings from './OSMSettings';
import AtlasOSMInfoList from './OSMInfoList';
import AtlasOSMInfoFilter from './OSMInfoFilter';
import AtlasOSMInfoDetail from './OSMInfoDetail';
import { ReactNode } from '@tanstack/react-router';

function MapInformationComponent({
  name,
  useMapInformation,
  filterKeys,
  iconMap,
  route,
}: {
  name: string;
  useMapInformation;
  filterKeys;
  iconMap;
  route;
}) {
  const {
    // Location
    map,
    activeAdministrativeRegion,
    isClustered,
    setIsClustered,
  } = useContext(AtlasContext)!;
  const { data, isLoading } = useMapInformation(activeAdministrativeRegion);

  const [activeElement, setActiveElement] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({}); // Store selected values for each filterKey

  const filteredData = data?.elements?.filter((element) => {
    return Object.entries(selectedFilters).every(([key, value]) => {
      if (!value) return true; // No filter applied for this key
      return element?.tags[key] === value; // Element must match the filter
    });
  });

  useEffect(() => {
    console.log('selectedFilters', selectedFilters);
    console.log('filterKeys', filterKeys);
    return () => {};
  }, [selectedFilters]);

  useEffect(() => {
    let layerObjects;
    if (map && data) {
      layerObjects = useOverpassLayer(
        map,
        filteredData,
        iconMap,
        filterKeys[0], // first filterkey is used set emojis on map
        isClustered,
        setActiveElement,
      );
    }
    return () => {
      if (layerObjects) {
        map?.removeLayer(layerObjects.overpassLayer);
      }
    };
  }, [map, filteredData, isClustered]);

  const showOnMap = useCallback((element) => {
    if (element.lat && element.lon) {
      map?.flyTo([element.lat, element.lon], 15, { duration: 2.7 });
    } else if (element?.bounds) {
      map?.flyToBounds(
        [
          [element.bounds.minlat, element.bounds.minlon],
          [element.bounds.maxlat, element.bounds.maxlon],
        ],
        { duration: 2.7 },
      );
    }
  }, []);

  const clusterSettings = {
    isClustered,
    setIsClustered,
  };

  return (
    <LegendLayout route={route}>
      <h1>
        {name} <span>{activeAdministrativeRegion['emoji']}</span>
      </h1>{' '}
      {isLoading && <p className="map-info__loading-emoji">🔍</p>}
      {filteredData && (
        <>
          <b className="container info">
            {filteredData.length}{' '}
            {Object.entries(selectedFilters).map(([key, value]) => {
              if (!value) return true; // No filter applied for this key
              return `${
                iconMap && iconMap[value as string] != undefined
                  ? (iconMap[value as string]?.options?.html as ReactNode)
                  : ''
              } ${value} `; // Element must match the filter
            })}{' '}
          </b>{' '}
          <span>Results</span>
        </>
      )}
      {data && (
        <>
          <AtlasOSMSettings {...clusterSettings} />
          {activeElement && (
            <>
              <AtlasOSMInfoDetail
                filterKeys={filterKeys}
                iconMap={iconMap}
                activeElement={activeElement}
                setActiveElement={setActiveElement}
                showOnMap={showOnMap}
              />
            </>
          )}
          <h2>Legend</h2>
          <h3>Filter</h3>
          <AtlasOSMInfoFilter
            data={data}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            filteredData={filteredData}
            iconMap={iconMap}
            filterKeys={filterKeys}
          />
          {data &&
            (() => {
              const groupByKey = filterKeys[0];

              const filterObj = { ...selectedFilters };
              const filteredData = (data.elements || []).filter((element) => {
                return Object.entries(filterObj).every(([key, filterValue]) => {
                  if (key === groupByKey) return true;
                  if (!filterValue) return true;
                  return element?.tags?.[key] === filterValue;
                });
              });

              const groups = {};
              filteredData.forEach((element) => {
                const groupValue = element.tags?.[groupByKey];
                if (groupValue != null) {
                  groups[groupValue] = groups[groupValue] || [];
                  groups[groupValue].push(element);
                }
              });
              return Object.entries(groups).map(([groupValue, groupData]) => (
                <AtlasOSMInfoList
                  key={groupValue}
                  listName={groupValue}
                  map={map}
                  data={groupData}
                  iconMap={iconMap}
                  activeAdministrativeRegion={activeAdministrativeRegion}
                  filterKeys={filterKeys}
                  activeElement={activeElement}
                  setActiveElement={setActiveElement}
                  showOnMap={showOnMap}
                />
              ));
            })()}
        </>
      )}
    </LegendLayout>
  );
}

export default React.memo(MapInformationComponent);
