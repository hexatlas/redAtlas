# red🅰️TLAS

: ![Live Demo](https://redatlas.app/)

Geopolitical visualization platform for socioeconomic, military, and infrastructure data analysis.

![HexAtlas](https://redatlas.netlify.app/safari-pinned-tab.svg)

## Key Features

- 🌍 Interactive Map Layers with minimap navigation
- 📊 Multi-dimensional data categories:
  - **Economy**: Industrial centers, trade flows, commodities
  - **Military**: Bases, forces, defense industry
  - **Government**: Public infrastructure, class structure
  - **Diplomacy**: Embassy networks, diplomatic corps
- 🎨 Consistent visual language with semantic coloring
- 🔗 Real-time data integration from multiple sources

## Atlas Component Hierarchy

```
- Atlas
  ├── Map
  │   ├── Interface
  │   └── Minimap
  │
  └── Legend
      ├── Economy
      │   ├── Links
      │   ├── Map
      │   │   ├── Industrial Centers
      │   │   ├── Commodities
      │   │   ├── Energy
      │   │   ├── Ports
      │   │   ├── etc.
      │   │   └── Trade
      │   │       ├── Imports
      │   │       └── Exports
      │   └── Charts (// Todo)
      │       └── GDP based on PPP, share of world
      │
      ├── Information
      │   ├── Links
      │   ├── Map (// Todo)
      │   │   ├── Media Landscape
      │   │   ├── Think Tanks
      │   │   ├── Diplomats
      │   │   └── etc.
      │   ├── Fediverse
      │   │   ├── Lemmy
      │   │   │   ├── Community
      │   │   │   │   └── CommunityInfoCard
      │   │   │   ├── User
      │   │   │   │   └── UserInfoCard
      │   │   │   ├── Posts
      │   │   │   └── Comments
      │   │   └── Mastodon
      │   └── Nexus
      │       ├── ProleWiki
      │       ├── NATOPedia
      │       ├── 72Ts News Bulletins
      │       ├── Anarchist Library
      │       └── etc.
      │
      ├── Dipolomacy
      │   ├── Links (// Todo)
      │   └── Map (// Todo)
      │       ├── Embassies, Consulates
      │       ├── Ambassadors
      │       └── etc.
      │
      ├── Military
      │   ├── Links (// Todo)
      │   └── Map (// Todo)
      │       ├── Bases
      │       ├── Forces
      │       ├── Industry
      │       └── etc.
      │
      └── Government
          ├── Links
          ├── Map (// Todo)
          │   ├── Hospitals
          │   ├── Firedepartmens
          │   ├── Policedepartments
          │   ├── Parks
          │   ├── Abandoned
          │   └── etc.
          └── Class Structure (// Todo)
              ├── Industrialists
              ├── Finance Capitalists
              ├── Landowners
              ├── Intelligentsia
              ├── Bourgeoise
              ├── Proletariat
              └── Armed Forces
```

## Development Setup

### Prerequisites

- Node.js v18+
- npm v9+
- Optional: API keys for:
  - OpenWeather (`VITE_OPENWEATHER_API_KEY`)

### Installation

```bash
cd atlas/frontend
npm install
cp .env
```

Configure `.env`:

```env
VITE_DATA_API_ENDPOINT=http://localhost:8080/api/
VITE_OPENWEATHER_API_KEY=your_key_here
VITE_OVERPASS_URL=https://overpass-api.de/api/interpreter
VITE_MODEL_BASEURL=https://api.deepseek.com
VITE_MODEL_APIKEY=sk-13abac12..
VITE_MODEL_NAME=deepseek-chat

```

VITE_DATA_API_ENDPOINT must point to redatlas/backend.

### Running Dev Server

```bash
npm run dev
```

## Adding New Layers

1. **Create Overpass Query Hook**

```tsx
// src/data/[instrument]/overpass/use[Layer]Query.tsx
export default const useLayerQuery = () => {

  const overpassQuery = `
      // Overpass Query
    `;

  const layer = useQuery({
    queryKey: [`Layer-${activeAdministrativeRegion['ISO3166-2']}`],
    queryFn: () => useOverpassAPI(overpassQuery),
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnMount: false,
  });

  return layer;
}

```

2. **Define Emoji Icon Mapping**

```tsx
// src/data/[instrument]/overpass/emoji/[layer].tsx
import L from 'leaflet';

const defaultIcon = L.divIcon({
  html: '🕊️', // Default for any unclassified diplomatic location
  className: 'emoji-icon',
});

const embassy = L.divIcon({
  html: '🏛️', // Embassy
  className: 'emoji-icon',
});

// etc.

export const iconMap = {
  defaultIcon,
  embassy,
  // etc.
};
```

3. **Implement Map Layer Route**

```tsx
// src/routes/[instrument]/map/[layer].tsx
export const Route = createFileRoute('/instrument/map/layer')({
  component: () => (
    <MapInformationComponent
      name={'Layer Locations'}
      useMapInformation={useLayer}
      filterKeys={['osm_key_1', 'osm_key_2']}
      iconMap={iconMap}
      route={Route}
    />
  ),
});
```

4.  **Add Route/Link**

```tsx
// src/routes/[instrument]/map.tsx;

const navigationLinks: AtlasNavigation[] = [
  {
    link: '/instrument/map/layer',
    emoji: '🪈',
    isDisabled: false,
  },
  // other routes
];
```

---

> **Note**: Frontend requires active [redAtlas backend](https://github.com/your-org/redatlas) instance for data operations. Use matching port configurations in both services.
