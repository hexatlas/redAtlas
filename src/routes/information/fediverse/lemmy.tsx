import React, { useContext, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { InformationContext } from '../../information';
import { AtlasContext } from '../../__root';
import useLemmy from '../../../data/information/fediverse/useLemmy';
import Comment from '../../../components/lemmy/Comment';
import Post from '../../../components/lemmy/Post';
import CommunityInfoCard from '../../../components/lemmy/CommunityInfoCard';

// https://www.radix-ui.com/primitives/docs/components/tabs
import * as Menubar from '@radix-ui/react-menubar';

import { searchTypes } from '../../../types/api.types';
import LegendLayout from '../../../components/shared/LegendLayout';

export const Route = createFileRoute('/information/fediverse/lemmy')({
  component: LemmyRouteComponent,
});

function LemmyRouteComponent() {
  const {
    // AtlasContext
    activeGeographicIdentifier,
    activeAdministrativeRegion,
  } = useContext(AtlasContext)!;

  const {
    locationQuery,
    setLocationQuery,
    // InformationContext
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
  } = useContext(InformationContext)!;

  const {
    // Get Lemmy Data
    posts,
    comments,
    communityList,
    setCurrentSearchResultPage,
    currentSearchResultPage,
    handleSearch,
    handleSearchQuery,
  } = useLemmy(
    // Location - AtlasContext
    activeGeographicIdentifier,
    activeAdministrativeRegion,
    locationQuery,
    setLocationQuery,

    // Lemmy - InformationContextf
    activeLemmyInstance,
    activeCommunity,
    setActiveCommunity,
    activeSearchType,
    activeListingType,
    activeSortType,
  );
  const [editLemmyInstance, setEditLemmyInstance] = useState<boolean>(false);

  return (
    <LegendLayout route={Route} className={'lemmy'}>
      <>
        <h1>
          <span></span>Hexbear
        </h1>
        {editLemmyInstance ? (
          <div className="search-input-wrapper">
            <button
              role="button"
              title="Reset Lemmy to Hexbear"
              aria-label="Reset Lemmy to Hexbear"
              className="atlas-reset-button"
              onClick={() => {
                setActiveLemmyInstance(defaultInstance);
              }}
            >
              {activeLemmyInstance.baseUrl} ⨯
            </button>

            <form className="search-form" role="search">
              <label htmlFor="search-input" className="sr-only">
                Paste Lemmy URL
              </label>
              <input
                name="search-input"
                type="search"
                className="search-input"
                aria-label="Paste Lemmy URL"
                placeholder="Paste Lemmy URL"
                onPaste={(e) => {
                  e.preventDefault();
                  setActiveLemmyInstance({
                    id: 1,
                    label: 'UserDefined',
                    baseUrl: e.clipboardData.getData('Text') || 'https://hexbear.net/',
                    community_id: null,
                    default: false,
                  });
                  setEditLemmyInstance(!editLemmyInstance);
                }}
              />
              {/* <button type="submit"></button> */}
            </form>
          </div>
        ) : (
          <div className="edit-instance">
            <button
              role="button"
              title="Change Lemmy Instance"
              aria-label="Change Lemmy Instance"
              onClick={() => setEditLemmyInstance(!editLemmyInstance)}
            >
              🔻
            </button>
            <a href={activeLemmyInstance.baseUrl} target="_blank" rel="noopener noreferrer">
              <span>{activeLemmyInstance.baseUrl}</span>
            </a>
          </div>
        )}
        {activeCommunity && activeCommunity?.community?.banner && (
          <CommunityInfoCard
            lemmyInstance={activeLemmyInstance}
            community={activeCommunity?.community}
          >
            <img
              className="banner-image"
              src={activeCommunity?.community?.banner}
              alt={`${activeCommunity?.community?.name} Community Banner`}
            />
          </CommunityInfoCard>
        )}
        <div className="search-input-wrapper">
          {activeCommunity?.community && (
            <CommunityInfoCard
              lemmyInstance={activeLemmyInstance}
              community={activeCommunity?.community}
            >
              <button
                role="button"
                title="Reset Atlas to default settings"
                aria-label="Styled Reset Atlas Settings to default settings"
                className="atlas-reset-button"
                onClick={() => setActiveCommunity(null)}
              >
                <span className="prefix">c/</span>
                {activeCommunity && activeCommunity?.community?.name} ⨯
              </button>
            </CommunityInfoCard>
          )}
          <form className="search-form">
            <label htmlFor="search-input" className="sr-only">
              Query Selected Location
            </label>
            <input
              name="search-input"
              type="search"
              className="search-input"
              aria-label="Query Selected Community about Region"
              placeholder={`Query ${activeAdministrativeRegion?.country !== 'country' ? activeAdministrativeRegion[activeGeographicIdentifier] : ''}`}
              value={locationQuery}
              onChange={handleSearch}
            />
          </form>
        </div>
        <div className="communities">
          {communityList &&
            communityList.map((communityView) => {
              const { community, counts } = communityView;
              return (
                <button
                  key={counts?.community_id}
                  className={`community__button ${
                    counts?.community_id === activeCommunity?.counts?.community_id &&
                    'community__button-active'
                  }`}
                  role="button"
                  aria-label={`${community?.name} community filter`}
                  onClick={() => {
                    if (activeCommunity === community) {
                      setActiveCommunity(null);
                    } else {
                      setActiveCommunity(communityView);
                    }
                  }}
                >
                  {community?.name}
                </button>
              );
            })}
        </div>

        <Menubar.Root className="wrapper">
          {/* SEARCH TYPE - Post/Comments */}
          <Menubar.Menu>
            <Menubar.Trigger className="option" aria-label="Select SearchType">
              {activeSearchType.label}
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content className="menu__content" align="start">
                <Menubar.RadioGroup value={activeSearchType} onValueChange={setActiveSearchType}>
                  {searchTypes.map((searchType, index) => (
                    <Menubar.RadioItem
                      className="option wrapper"
                      key={index}
                      value={searchType as unknown as string}
                    >
                      <Menubar.ItemIndicator className="info">»</Menubar.ItemIndicator>
                      {searchType.label}
                    </Menubar.RadioItem>
                  ))}
                </Menubar.RadioGroup>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>

          {/* LISTING TYPE - Local, Global Scope */}
          <Menubar.Menu>
            <Menubar.Trigger className="option" aria-label="Select SearchType">
              {activeListingType.label}
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content className="menu__content" align="start">
                <Menubar.RadioGroup value={activeListingType} onValueChange={setActiveListingType}>
                  {listingTypes.map((listingType, index) => (
                    <Menubar.RadioItem
                      className="option wrapper"
                      key={index}
                      value={listingType as unknown as string}
                    >
                      <Menubar.ItemIndicator className="info">»</Menubar.ItemIndicator>
                      {listingType.label} {listingType.value}
                    </Menubar.RadioItem>
                  ))}
                </Menubar.RadioGroup>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>

          {/* SORTING TYPE - Hot, Active, Most Comments, Top Day, etc. */}
          <Menubar.Menu>
            <Menubar.Trigger className="option" aria-label="Select SearchType">
              {activeSortType.label}
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content className="menu__content" align="start">
                <Menubar.RadioGroup value={activeSortType} onValueChange={setActiveSortType}>
                  {sortTypes.map((sortType, index) => (
                    <Menubar.RadioItem
                      className="option wrapper"
                      key={index}
                      value={sortType as unknown as string}
                    >
                      <Menubar.ItemIndicator className="info">»</Menubar.ItemIndicator>
                      {sortType.label} {sortType.value}
                    </Menubar.RadioItem>
                  ))}
                </Menubar.RadioGroup>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        </Menubar.Root>

        {comments && activeSearchType.value === 'Comments' && (
          <div className="comment__replies">
            {comments.length > 0 &&
              comments.map((commentView, index) => {
                const { comment } = commentView;
                return (
                  comment?.removed ||
                  comment?.deleted || (
                    <Comment
                      key={`${comment.id}${index * Math.random()}`}
                      commentView={commentView}
                      // community={activeCommunity}
                      lemmyInstance={activeLemmyInstance}
                      commentSort={activeSortType}
                      ratioDetector={99} // init value for top level comment - highlights all comment with more than 99 upvotes; <Comment /> calls itself recursively
                    />
                  )
                );
              })}
          </div>
        )}
        {posts && activeSearchType.value === 'Posts' && (
          <div className="comment__replies">
            {posts.length > 0 &&
              posts.map((postView, index) => {
                const { post } = postView;
                return (
                  <Post
                    key={`${post.id}${index * Math.random()}`}
                    postView={postView}
                    // community={activeCommunity}
                    lemmyInstance={activeLemmyInstance}
                    commentSort={activeSortType}
                  />
                );
              })}
          </div>
        )}
        <button
          className="action"
          onClick={() => setCurrentSearchResultPage(currentSearchResultPage + 1)}
        >
          View More
        </button>
      </>
      <div className="legend__footer">
        <a
          href={encodeURI(
            `${activeLemmyInstance.baseUrl}search?q=${encodeURIComponent(
              handleSearchQuery(),
            )}&type=${activeSearchType.value}&listingType=${activeListingType.value}&communityId=${
              activeCommunity?.counts?.community_id
            }&page=${currentSearchResultPage}&sort=${activeSortType.value}`,
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          🔗 view in {activeLemmyInstance.baseUrl}
        </a>
      </div>
    </LegendLayout>
  );
}
