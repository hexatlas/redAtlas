import React from 'react';

import { useCallback, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap, Rectangle, useMapEvent } from 'react-leaflet';
import { LeafletContextInterface, useEventHandlers } from '@react-leaflet/core';
import { PathOptions } from 'leaflet';

// Leaflet Position Classes4

interface PositionClasses {
  bottomleft: string;
  bottomright: string;
  topleft: string;
  topright: string;
}

const POSITION_CLASSES: PositionClasses = {
  bottomleft: 'minimap leaflet-bottom leaflet-left',
  bottomright: 'minimap leaflet-bottom leaflet-right',
  topleft: 'minimap leaflet-top leaflet-left',
  topright: 'minimap leaflet-top leaflet-right',
};

const BOUNDS_STYLE: PathOptions = {
  weight: 0.161,
  color: 'var(--surface-atlas-info-active)',
};

function MinimapBounds({ parentMap, zoom }: { parentMap: L.Map; zoom: number }) {
  const minimap = useMap();

  // Clicking a point on the minimap sets the parent's map center
  const onClick = useCallback(
    (e: { latlng: L.LatLng }) => {
      parentMap.setView(e.latlng, parentMap.getZoom());
    },
    [parentMap],
  );
  useMapEvent('click', onClick);

  // Keep track of bounds in state to trigger renders
  const [bounds, setBounds] = useState(parentMap.getBounds());
  const onChange = useCallback(() => {
    setBounds(parentMap.getBounds());
    // Update the minimap's view to match the parent map's center and zoom
    minimap.setView(parentMap.getCenter(), zoom);
  }, [minimap, parentMap, zoom]);

  // Listen to events on the parent map
  const handlers = useMemo(() => ({ move: onChange, zoom: onChange }), []);
  useEventHandlers(
    {
      instance: parentMap,
      context: parentMap as unknown as LeafletContextInterface,
    },
    handlers,
  );

  return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE} />;
}

export default function MiniMapControl({
  position,
  zoom,
  size,
}: {
  position?: keyof PositionClasses;
  zoom?: number;
  size?: string;
}) {
  const parentMap = useMap();
  const mapZoom = zoom || 2;

  // Memoize the minimap so it's not affected by position changes
  const minimap = useMemo(
    () => (
      <MapContainer
        style={{
          height: size,
          width: size,
        }}
        center={parentMap.getCenter()}
        zoom={mapZoom}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer
          url={"https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png'"}
          maxZoom={18}
          attribution={
            'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
          }
          opacity={1}
        />
        <MinimapBounds parentMap={parentMap} zoom={mapZoom} />
      </MapContainer>
    ),
    [],
  );

  const positionClass = POSITION_CLASSES[position ?? 'bottomleft'];
  return (
    <div className={positionClass}>
      <div className="leaflet-control leaflet-bar">{minimap}</div>
    </div>
  );
}
