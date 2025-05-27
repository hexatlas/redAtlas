// Import Dependencies
import React, { createContext } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CommunityView } from 'lemmy-js-client';
// Import Types
import {
  AtlasLemmyListingType,
  AtlasLemmySearchType,
  AtlasLemmySortType,
  AtlasLemmyInstanceType,
  listingTypes,
  searchTypes,
  sortTypes,
  AtlasLemmyCommentSortType,
} from '../types/api.types';
import { InformationLemmyProps, AtlasNavigation } from '../types/atlas.types';
// Import Components
import LegendNavigation from '../components/shared/Navigation';
// Import Utils
import { useStateStorage } from '../hooks/useUtils';

export const InformationContext = createContext<InformationLemmyProps | null>(
  null,
);

export const Route = createFileRoute('/information')({
  component: InformationRouteComponent,
});

const navigationLinks: AtlasNavigation[] = [
  {
    link: '/information/links',
    emoji: '🔗',
    isDisabled: false,
  },
  {
    link: '/information/map',
    emoji: '🌐',
    isDisabled: false,
  },
  {
    link: '/information/nexus',
    emoji: '📚',
    isDisabled: false,
  },
  {
    link: '/information/fediverse',
    emoji: '👥',
    isDisabled: false,
  },
  {
    link: '/information/chat',
    emoji: '🗨️',
    isDisabled: false,
  },
];

function InformationRouteComponent() {
  const defaultInstance = {
    id: 0,
    label: 'hexbear.net',
    baseUrl: 'https://hexbear.net/',
    community_id: 6, // !news@hexbear.net
    default: true,
  };

  const [locationQuery, setLocationQuery] = useStateStorage<string>(
    'locationQuery',
    '',
  );

  // LEMMY
  const [activeLemmyInstance, setActiveLemmyInstance] =
    useStateStorage<AtlasLemmyInstanceType>(
      'activeLemmyInstance',
      defaultInstance, // Default: hexbear.net
    );

  const [activeCommunity, setActiveCommunity] = useStateStorage<CommunityView>(
    'activeCommunity',
    null,
  );

  const [activeSearchType, setActiveSearchType] =
    useStateStorage<AtlasLemmySearchType>('activeSearchType', searchTypes[0]); // Default: Comments

  const [activeListingType, setActiveListingType] =
    useStateStorage<AtlasLemmyListingType>(
      'activeListingType',
      listingTypes[1],
    ); // Default: Local

  const [activeSortType, setActiveSortType] = useStateStorage<
    AtlasLemmySortType | AtlasLemmyCommentSortType
  >('activeSortType', sortTypes[1]); // Default: New Sort

  const informationLemmyProps: InformationLemmyProps = {
    locationQuery,
    setLocationQuery,

    // Community
    defaultInstance,
    activeLemmyInstance,
    setActiveLemmyInstance,

    activeCommunity,
    setActiveCommunity,

    activeSearchType,
    setActiveSearchType,

    listingTypes,
    activeListingType,
    setActiveListingType,

    sortTypes,
    activeSortType,
    setActiveSortType,
  };

  return (
    <InformationContext.Provider value={informationLemmyProps}>
      <LegendNavigation
        links={navigationLinks}
        route={Route}
      ></LegendNavigation>
    </InformationContext.Provider>
  );
}
