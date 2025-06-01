// File: useOverpassLayer.js
import L from 'leaflet';
import 'leaflet.markercluster';

export default function useOverpassLayer(
  map,
  data,
  iconMap,
  filterKey,
  isClustered = true,
  setActiveElement,
) {
  const { defaultIcon } = iconMap;

  let overpassLayer;

  // Helper function: Create or get cluster group for a key
  const getClusterGroup = (clusters, clusterKey) => {
    if (!clusters[clusterKey]) {
      clusters[clusterKey] = L.markerClusterGroup({
        polygonOptions: { weight: 1.5, color: '#FFCC0D', opacity: 0.5 },
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `
            <div class="cluster-container">
              <span class="cluster-count accent--invert">${count}</span>
              <span class="cluster-emoji">${
                iconMap[clusterKey]?.options?.html ||
                `<small class="cluster-text">${clusterKey}</small>`
              }</span>
            </div>`,
            className: 'cluster-info',
          });
        },
      });
      overpassLayer.addLayer(clusters[clusterKey]);
    }
    return clusters[clusterKey];
  };

  // Helper function: Add marker to appropriate cluster
  const addMarkerToCluster = (clusters, lat, lon, tags, element) => {
    const clusterKey = tags[filterKey] || 'defaultIcon';
    const icon = iconMap[tags[filterKey]] || defaultIcon;
    const clusterGroup = getClusterGroup(clusters, clusterKey);

    const marker = L.marker([lat, lon], { icon });
    const popupContent = `
      <h1 class="emoji">${iconMap[clusterKey]?.options?.html || 'N/A'}</h1>
      <h4>${tags?.name || 'Unnamed'}</h4>
      <p>${tags['name:en'] || ''}</p>
      <pre>${JSON.stringify(tags, null, 2)}</pre>
    `;
    const popup = L.popup().setContent(popupContent);
    marker.bindPopup(popup);

    // Add event listener for popup open
    marker.on('popupopen', () => {
      setActiveElement(element);
    });

    clusterGroup.addLayer(marker);
  };

  // Helper function: Add polyline with optional marker
  const addPolylineWithMarker = (clusters, coordinates, tags, element) => {
    if (coordinates.length === 0) return;

    const polyline = L.polyline(coordinates, {
      color: 'hsl(var(--color-atlas-accent) / var(--opacity-atlas-3))',
      weight: 8,
    });
    overpassLayer.addLayer(polyline);

    const [lat, lon] = coordinates[0];
    addMarkerToCluster(clusters, lat, lon, tags, element);
  };

  if (isClustered) {
    const clusters = {};
    overpassLayer = L.layerGroup();

    // Process elements
    data.forEach((element) => {
      if (element.type === 'node') {
        const { lat, lon, tags } = element;
        addMarkerToCluster(clusters, lat, lon, tags, element);
      } else if (element.type === 'way') {
        const { geometry, tags } = element;
        const coordinates = geometry.map((point) => [point.lat, point.lon]);
        addPolylineWithMarker(clusters, coordinates, tags, element);
      } else if (element.type === 'relation') {
        const { members, tags } = element;
        const wayMembers = members.filter((member) => member.type === 'way');

        wayMembers.forEach((member) => {
          if (member.geometry) {
            const coordinates = member.geometry.map((point) => [point.lat, point.lon]);
            addPolylineWithMarker(clusters, coordinates, tags, element);
          }
        });
      }
    });
  } else {
    // Non-clustered layer group
    overpassLayer = L.layerGroup();

    data.forEach((element) => {
      if (element.type === 'node') {
        const { lat, lon, tags } = element;
        const icon = iconMap[tags[filterKey]] || defaultIcon;
        const marker = L.marker([lat, lon], { icon });
        const popupContent = `
          <h1 class="emoji">${iconMap[filterKey]?.options?.html || 'N/A'}</h1>
          <h4>${tags?.name || 'Unnamed'}</h4>
          <p>${tags['name:en'] || ''}</p>
          <pre>${JSON.stringify(tags, null, 2)}</pre>
        `;
        const popup = L.popup().setContent(popupContent);
        marker.bindPopup(popup);

        marker.on('popupopen', () => {
          setActiveElement(element);
        });

        overpassLayer.addLayer(marker);
      } else if (element.type === 'way') {
        const { geometry, tags } = element;
        const coordinates = geometry.map((point) => [point.lat, point.lon]);

        const polyline = L.polyline(coordinates, {
          color: 'hsl(var(--color-atlas-accent) / var(--opacity-atlas-3))',
          weight: 8,
        });
        overpassLayer.addLayer(polyline);

        if (coordinates.length > 0) {
          const icon = iconMap[tags[filterKey]] || defaultIcon;
          const marker = L.marker(coordinates[0], { icon });
          const popupContent = `
            <h1 class="emoji">${iconMap[filterKey]?.options?.html || 'N/A'}</h1>
            <h4>${tags?.name || 'Unnamed'}</h4>
            <p>${tags['name:en'] || ''}</p>
            <pre>${JSON.stringify(tags, null, 2)}</pre>
          `;
          const popup = L.popup().setContent(popupContent);
          marker.bindPopup(popup);

          // Add event listener for popup open
          marker.on('popupopen', () => {
            setActiveElement(element);
          });

          overpassLayer.addLayer(marker);
        }
      }
    });
  }

  // Add the layer to the map
  map.addLayer(overpassLayer);

  return {
    overpassLayer,
  };
}
