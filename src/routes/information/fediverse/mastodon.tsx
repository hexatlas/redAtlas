import React, { useContext } from 'react';
import { createFileRoute } from '@tanstack/react-router';

// https://www.radix-ui.com/primitives/docs/components/collapsible
import * as Collapsible from '@radix-ui/react-collapsible';

import { AtlasContext } from '../../__root';
import useMastodon from '../../../data/information/fediverse/useMastodon';
import { TimeAgo } from '../../../hooks/useDataTransform';
import LegendLayout from '../../../components/shared/LegendLayout';
import Markdown from '../../../components/shared/Markdown';

export const Route = createFileRoute('/information/fediverse/mastodon')({
  component: MastodonRouteComponent,
});

function MastodonRouteComponent() {
  const { activeGeographicIdentifier, activeAdministrativeRegion } = useContext(AtlasContext)!;

  const { mastodonPosts, isLoading } = useMastodon(
    activeAdministrativeRegion,
    activeGeographicIdentifier,
  );

  const highlightArray = [
    activeAdministrativeRegion.name,
    activeAdministrativeRegion.country,
    activeAdministrativeRegion.region,
    activeAdministrativeRegion['sub-region'],
    activeAdministrativeRegion['intermediate-region'],
  ];

  return (
    <LegendLayout route={Route}>
      <>
        <h1>
          <span></span>Mastodon
        </h1>
        <h3>Latest Posts on {activeAdministrativeRegion[activeGeographicIdentifier]}</h3>

        {isLoading && <p className="map-info__loading-emoji">🔍</p>}
        {mastodonPosts &&
          mastodonPosts.map((post, index) => (
            <div className="feed-item" key={index}>
              <Collapsible.Root className="feed-community">
                <div className="feed-post-container">
                  <Collapsible.Trigger
                    className="post__thumbnail"
                    tabIndex={0}
                    aria-label="Expand Post"
                  >
                    <img
                      className="post__thumbnail--image"
                      src={post.account.avatar}
                      alt={post.account.username}
                    />
                  </Collapsible.Trigger>

                  <div>
                    <h2>{post.account.display_name}</h2>{' '}
                    <div className="feed-post-container">
                      <p className="feed-post-stat">{post.account.statuses_count} Posts</p>
                      <p className="feed-post-stat">{post.account.following_count} Following</p>
                      <p className="feed-post-stat">{post.account.followers_count} Followers</p>
                    </div>
                    <small>
                      {post.account.bot && <span>🤖</span>}
                      <a href={post.account.uri} target="_blank" rel="noopener noreferrer">
                        {post.account.acct}
                      </a>
                    </small>
                  </div>
                </div>
                <Collapsible.Content>
                  <div
                    className="feed-post-wrapper"
                    dangerouslySetInnerHTML={{ __html: post?.account.note }}
                  ></div>
                </Collapsible.Content>
              </Collapsible.Root>
              <p className="feed-publish-date highlight">
                {post.edited_at && <span>🖊️</span>}
                {' 🗓️ '}

                <TimeAgo dateString={post?.edited_at ? post.edited_at : post.created_at} />
              </p>
              {post?.media_attachments.length > 0 && (
                <div
                  className={`post-card ${
                    post?.media_attachments.length > 0 && 'post-media-gallery'
                  }`}
                >
                  {post?.media_attachments.map((item) => {
                    switch (item.type) {
                      case 'image':
                        return (
                          <img
                            className={`post-card-image`}
                            src={item.preview_url}
                            alt={item.description}
                          />
                        );
                        break;
                      case 'video':
                        return (
                          <video
                            className="post-card-video"
                            width="100%"
                            controls
                            autoPlay
                            muted
                            loop
                          >
                            <source src={item.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        );
                        break;

                      default:
                        break;
                    }
                  })}
                </div>
              )}
              <Markdown highlight={highlightArray}>{post?.content}</Markdown>

              {post?.card && (
                <a
                  className="post-card"
                  href={post?.card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {post?.card?.image && (
                    <img
                      className={`post-card-image`}
                      src={post?.card?.image}
                      alt={post?.card?.image_description}
                    />
                  )}
                  {post?.card.published_at && (
                    <span>
                      🗓️ <TimeAgo dateString={post?.card.published_at} />
                    </span>
                  )}
                  {post?.card.provider_name && <h6>{post?.card.provider_name}</h6>}
                  {post?.card.title && <h3>{post?.card.title}</h3>}
                  {post?.card.author_name && <small>👤 {post?.card.author_name}</small>}
                  {post?.card.description && <p>{post?.card.description}</p>}
                  {post?.card.url && <small className="post-card-link">🔗 {post?.card.url}</small>}
                </a>
              )}

              {post?.tags.length > 0 && (
                <div className="post-tags">
                  {post?.tags.map((item, index) => (
                    <h6 key={index}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="highlight"
                      >
                        #{item.name}
                      </a>
                    </h6>
                  ))}
                </div>
              )}

              <div className="feed-post-container post-stats">
                <p>💬 {post.replies_count}</p>
                <p>🔄 {post.reblogs_count}</p>
                <p>⭐ {post.favourites_count}</p>
              </div>
              <a className="post-link" href={post.url} target="_blank" rel="noopener noreferrer">
                🔗 <small>{post.url}</small>
              </a>
            </div>
          ))}
      </>
      <div className="legend__footer">
        <a
          href={`https://mastodon.social/tags/${activeAdministrativeRegion?.country}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View more on Mastodon.Social
        </a>
      </div>
    </LegendLayout>
  );
}
