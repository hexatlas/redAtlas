import React, { useContext, useEffect, useState } from 'react';

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

  const clusterSettings = {
    isClustered,
    setIsClustered,
  };

  return (
    <LegendLayout route={route}>
      <h1>
        {name} <span>{activeAdministrativeRegion['emoji']}</span>
      </h1>{' '}
      <h2>Filter</h2>
      <AtlasOSMInfoFilter
        data={data}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        filteredData={filteredData}
        iconMap={iconMap}
        filterKeys={filterKeys}
      />
      {filteredData && (
        <p>
          {filteredData.length}{' '}
          {Object.entries(selectedFilters).map(([key, value]) => {
            if (!value) return true; // No filter applied for this key
            return `${
              iconMap && iconMap[value as string] != undefined
                ? (iconMap[value as string]?.options?.html as ReactNode)
                : ''
            } ${value} `; // Element must match the filter
          })}{' '}
          results
        </p>
      )}
      <AtlasOSMSettings {...clusterSettings} />
      {isLoading && <p className="map-info__loading-emoji">🔍</p>}
      {activeElement && (
        <>
          <h2>DetailView</h2>
          <AtlasOSMInfoDetail
            filterKeys={filterKeys}
            iconMap={iconMap}
            activeElement={activeElement}
          />
        </>
      )}
      <h2>Legend</h2>
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
            />
          ));
        })()}
    </LegendLayout>
  );
}

export default React.memo(MapInformationComponent);
