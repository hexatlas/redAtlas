// Important: Needs to match geoJSON properties with the imported administrativeRegionsData in src/geojson that get's imported in Atlas.tsx

import { ReactNode, ToPathOption } from '@tanstack/react-router';
import { Message } from 'ollama/browser';
import { ReactElement } from 'react';

export type GeographicIdentifier =
  | 'name'
  | 'country'
  | 'emoji'
  | 'image'
  | 'ISO3166-2'
  | 'ISO3166-3'
  | 'sub-region'
  | 'intermediate-region'
  | 'region'
  | 'country-code'
  | 'sub-region-code'
  | 'intermediate-region-code'
  | 'region-code'
  | 'id';

export const geographicIdentifiers: Array<GeographicIdentifier> = [
  'name',
  'country',
  'emoji',
  'image',
  'ISO3166-2',
  'ISO3166-3',
  'sub-region',
  'intermediate-region',
  'region',
  'country-code',
  'sub-region-code',
  'intermediate-region-code',
  'region-code',
  'id',
];

export interface AdministrativeRegionObject {
  name: string;
  country: string;
  emoji: string;
  image?: string;
  'ISO3166-2': string;
  'ISO3166-3': string;
  'sub-region': string;
  'intermediate-region': string;
  region: string;
  'country-code': string;
  'sub-region-code': string;
  'intermediate-region-code': string;
  'region-code': string;
  id: number;
}

export interface AtlasState {
  // Util
  isMobile: boolean;
  legendSize: number;
  isClustered: boolean;
  map: L.Map | null;
  isOpenAtlasMapInterface: boolean;
  nominatim: NominatimResponse | undefined;
  activeGeographicIdentifier: GeographicIdentifier;
  activeAdministrativeRegion: AdministrativeRegionObject;
  administrativeRegionClickHistoryArray: LocationSelection[];
  isLocationSelectMode: boolean;
  activeLocationSelection: LocationSelection[];
}

export type AtlasAction = {
  type: string;
  payload?:
    | boolean
    | number
    | L.Map
    | NominatimResponse
    | GeographicIdentifier
    | AdministrativeRegionObject
    | LocationSelection[]
    | undefined
    | null;
};

export interface AtlasInterfaceProps {
  route?;
  // Util
  isMobile: boolean;
  resetAtlas: () => void;
  sideBarRef: React.RefObject<HTMLInputElement>;

  legendSize: number;
  setLegendSize: (legendSize: number) => void;

  isClustered: boolean;
  setIsClustered: (isClustered: boolean) => void;

  // Location
  map: L.Map | null;
  setMap: (map: L.Map | null) => void;

  isOpenAtlasMapInterface: boolean;
  setIsOpenAtlasMapInterface: (isOpenAtlasMapInterface: boolean) => void;

  isLocationSelectMode: boolean;
  setIsLocationSelectMode: (isLocationSelectMode: boolean) => void;

  nominatim: NominatimResponse | undefined;
  setNominatim: (nominatim: NominatimResponse) => void;

  activeGeographicIdentifier: GeographicIdentifier;
  setActiveGeographicIdentifier: (activeGeographicIdentifier: GeographicIdentifier) => void;

  activeAdministrativeRegion: AdministrativeRegionObject;
  setActiveAdministrativeRegion: (activeAdministrativeRegion: AdministrativeRegionObject) => void;

  administrativeRegionClickHistoryArray: LocationSelection[];
  setAdministrativeRegionClickHistoryArray: (
    administrativeRegionClickHistoryArray: LocationSelection[],
  ) => void;

  activeLocationSelection: LocationSelection[];
  setActiveLocationSelection: (activeLocationSelection: LocationSelection[]) => void;

  handleRandom;
}

export interface LocationSelection {
  activeSelection: string | number | undefined;
  activeGeographicIdentifier: GeographicIdentifier;
  activeAdministrativeRegion: AdministrativeRegionObject;
}

export interface MapState {
  activeAdministrativeRegion: AdministrativeRegionObject;
  setActiveAdministrativeRegion: (region: AdministrativeRegionObject) => void;

  activeGeographicIdentifier: GeographicIdentifier;
  setActiveGeographicIdentifier: (type: GeographicIdentifier) => void;

  isClustered: boolean;
  setIsClustered: (clustered: boolean) => void;
}

export interface AtlasNavigation {
  link: ToPathOption;
  emoji: ReactElement | string;
  isDisabled: boolean;
}

export interface NominatimResponse {
  features: NominatimFeature[];
}

export interface NominatimFeature {
  properties: { name: string };
}

export interface InformationLemmyProps {
  locationQuery: string;
  setLocationQuery: (locationQuery: string) => void;
  // Community
  defaultInstance;
  activeLemmyInstance;
  setActiveLemmyInstance;

  activeCommunity;
  setActiveCommunity;

  activeSearchType;
  setActiveSearchType;

  listingTypes;
  activeListingType;
  setActiveListingType;

  sortTypes;
  activeSortType;
  setActiveSortType;
}

export interface OSMElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  bounds?: {
    minlat: number;
    minlon: number;
    maxlat: number;
    maxlon: number;
  };
  tags: {
    [key: string]: string;
  };
}

export interface OSMInfoCardProps {
  element: OSMElement;
  children?: ReactNode;
  index: number;
  iconMap?: {
    [key: string]: L.DivIcon;
  };
  filterKeys?: string[];
  handleMouseEnter: (element: OSMElement) => void;
  handleMouseLeave: (element: OSMElement) => void;
  handleClick: (element: OSMElement) => void;
  activeElement: OSMElement | null;
}

export interface OSMInfoListProps {
  listName: string;
  map: L.Map | null;
  iconMap: {
    [key: string]: L.DivIcon;
  };
  filterKeys: string[];
  data;
  activeAdministrativeRegion: AdministrativeRegionObject;
  activeElement;
  setActiveElement;
  showOnMap;
}

export type MessageWithThinking = Message & {
  finishedThinking?: boolean;
  think?: string;
  timestamp?: number;
};

export interface GeneratedLocations {
  name: string;
  description: string;
  emoji: string;
  nominatim: string;
  nominatimResponse?: unknown;
  group_name?: string;
  group_emoji?: string;
  group_description?: string;
}

export interface ModelConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  max_tokens: number;
  systemPrompt: string;
}

export interface ChatModelConfigProps {
  modelConfig: ModelConfig;
  setModelConfig;
  models;
  activeModel;
  setActiveModel;
}
