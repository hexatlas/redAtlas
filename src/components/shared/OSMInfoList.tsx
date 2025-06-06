import React, { useCallback, useState } from 'react';
// https://www.radix-ui.com/primitives/docs/components/accordion
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Accordion from '@radix-ui/react-accordion';
import AtlasOSMInfoCard from './OSMInfoCard';

import { OSMInfoListProps } from '../../types/atlas.types';
import { LatLngBoundsExpression } from 'leaflet';

function AtlasOSMInfoList({
  listName,
  map,
  iconMap,
  filterKeys,
  data,
  activeAdministrativeRegion,
  activeElement,
  setActiveElement,
  showOnMap,
}: OSMInfoListProps) {
  const [lastMapBounds, setLastMapBounds] = useState<LatLngBoundsExpression | undefined>(
    map?.getBounds(),
  );

  const handleClick = useCallback((element) => {
    if (element.lat && element.lon) {
      setLastMapBounds([
        [element.lat, element.lon],
        [element.lat, element.lon],
      ] as LatLngBoundsExpression);
    } else if (element?.bounds) {
      setLastMapBounds([
        [element.bounds.minlat, element.bounds.minlon],
        [element.bounds.maxlat, element.bounds.maxlon],
      ] as LatLngBoundsExpression);
    }
    if (element) setActiveElement(element);
    if (element === activeElement) setActiveElement(null);
    showOnMap(element);
  }, []);

  let debounce;

  const handleMouseEnter = useCallback((element) => {
    debounce = setTimeout(() => {
      setLastMapBounds(map?.getBounds());
      showOnMap(element);
    }, 450);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(debounce);
    map?.flyToBounds(lastMapBounds as LatLngBoundsExpression, {
      duration: 1.35,
    });
  }, [lastMapBounds]);

  return (
    <>
      <Collapsible.Root
        className="container neutral"
        aria-label={`${data.length} ${listName} in ${activeAdministrativeRegion['country']}`}
        aria-description={`List of ${listName} in ${activeAdministrativeRegion['country']}`}
        aria-live="polite"
      >
        <Collapsible.Trigger className="legend__item">
          {iconMap[listName]?.options?.html ? (
            <span className="emoji" aria-hidden="true">
              {`${iconMap[listName]?.options?.html}`}
            </span>
          ) : (
            <span></span>
          )}

          <h5 aria-label="plant:source">{listName}</h5>

          <b className="container info">{data.length}</b>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <Accordion.Root
            type="multiple"
            role="list"
            aria-label={`${listName} in ${activeAdministrativeRegion['country']}`}
            aria-description={`List of ${listName} in ${activeAdministrativeRegion['country']}`}
            aria-live="polite"
            id="list"
            className={'list'}
          >
            {data &&
              data.map((element, index) => {
                return (
                  <>
                    <AtlasOSMInfoCard
                      key={index}
                      index={index}
                      element={element}
                      iconMap={iconMap}
                      filterKeys={filterKeys}
                      handleMouseEnter={handleMouseEnter}
                      handleMouseLeave={handleMouseLeave}
                      handleClick={handleClick}
                      activeElement={activeElement}
                    ></AtlasOSMInfoCard>
                    <hr />
                  </>
                );
              })}
          </Accordion.Root>
        </Collapsible.Content>
      </Collapsible.Root>
    </>
  );
}

export default React.memo(AtlasOSMInfoList);
