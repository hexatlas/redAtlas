import React, { useMemo, createContext } from 'react';
import { createRootRoute } from '@tanstack/react-router';

// import { TanStackRouterDevtools } from '@tanstack/router-devtools';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import '../css/Index.scss';

// Import Components
import AtlasMap from '../components/map/Index';
import AtlasInterface from '../components/map/AtlasInterface';

// Types
import { AtlasInterfaceProps, AtlasNavigation } from '../types/atlas.types';

import LegendNavigation from '../components/shared/Navigation';
import useAtlas from '../hooks/useAtlas';

export const AtlasContext = createContext<AtlasInterfaceProps | null>(null);

export const Route = createRootRoute({
  component: AtlasRootComponent,
  validateSearch: (search: Record<string, unknown>) => {
    const geographicIdentifier = Object.keys(search)[0];
    const location = geographicIdentifier || 'country';
    return {
      [location]: search[location] as string | number,
      id: search.id as number,
      bounds: search.bounds as string,
    };
  },
});

function AtlasRootComponent() {
  const atlasInterfaceProps: AtlasInterfaceProps = useAtlas(Route);
  const {
    // Util
    map,
    isMobile,
    legendSize,
    setLegendSize,
    activeGeographicIdentifier,
    activeAdministrativeRegion,
  } = atlasInterfaceProps;

  const DisplayAtlasMap = useMemo(
    () => <AtlasMap {...atlasInterfaceProps} route={Route} />,
    [activeAdministrativeRegion, activeGeographicIdentifier],
  );

  /* 
    Handlers
 */
  const handleLegendResize = () => {
    function onMouseMove(mouseMoveEvent) {
      setLegendSize(document.body.clientWidth - mouseMoveEvent.clientX);
      map?.invalidateSize();
    }
    function onMouseUp() {
      document.body.removeEventListener('mousemove', onMouseMove);
    }

    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseup', onMouseUp, { once: true });
  };

  return (
    <AtlasContext.Provider value={atlasInterfaceProps}>
      <main
        className={`atlas ${
          activeAdministrativeRegion?.country !== 'country' && 'atlas--active'
        }`}
        style={{
          gridTemplateColumns: `1.6180339887498948482fr ${legendSize}px`,
        }}
        aria-label="Atlas Main View"
      >
        <aside
          className={`map`}
          aria-label="Map"
          role="application"
          aria-description="Use arrow keys to pan, plus and minus to zoom"
        >
          {DisplayAtlasMap}
          {!isMobile && <AtlasInterface {...atlasInterfaceProps} />}
        </aside>
        <article
          id="legend"
          aria-label="Legend"
          aria-description="Find useful information pertaining to the selected location"
        >
          {isMobile && <AtlasInterface {...atlasInterfaceProps} />}
          <LegendNavigation
            links={navigationLinks}
            route={Route}
          ></LegendNavigation>
          {!isMobile && (
            <>
              <button
                role="button"
                title="Click and Drag to Resize"
                aria-label="Resize Button. Click and Drag to Resize"
                className="legend__resize"
                onMouseDown={handleLegendResize}
              >
                ↔️
              </button>
            </>
          )}
        </article>
      </main>
    </AtlasContext.Provider>
  );
}

const navigationLinks: AtlasNavigation[] = [
  {
    link: '/economy',
    emoji: '💵',
    isDisabled: false,
  },
  {
    link: '/information',
    emoji: 'ℹ️',
    isDisabled: false,
  },
  {
    link: '/diplomacy',
    emoji: '🕊️',
    isDisabled: false,
  },
  {
    link: '/military',
    emoji: '🛡️',
    isDisabled: false,
  },
  {
    link: '/government',
    emoji: '🏛️',
    isDisabled: false,
  },
];
