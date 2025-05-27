import React, { useContext } from 'react';
import Post from '../lemmy/Post';
import Comment from '../lemmy/Comment';
import { InformationContext } from '../../routes/information';
import useHexbear from '../../data/shared/useHexbear';

function HexBear({
  children = <>Search on hexbear.net</>,
  query,
}: {
  children;
  query: string;
}) {
  const { activeLemmyInstance, activeCommunity, activeSortType } =
    useContext(InformationContext)!;

  const { comments, posts, isLoaded, fetchHexBear } = useHexbear(
    query,
    activeLemmyInstance,
    activeCommunity,
  );

  return (
    <div className="feed-community">
      {!isLoaded && (
        <p
          className="comment__reply-button"
          role="button"
          tabIndex={0}
          aria-label="Show Replies"
          onClick={fetchHexBear}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchHexBear();
            }
          }}
        >
          <span className="comment__reply-button__emoji">💬</span> {children}
        </p>
      )}
      {posts.length > 0 && (
        <div className="comment__replies">
          {posts.length > 0 &&
            posts.map((post, index) => (
              <Post
                key={index}
                postView={post}
                lemmyInstance={activeLemmyInstance}
                commentSort={activeSortType}
              />
            ))}
        </div>
      )}
      {comments &&
        comments.length > 0 &&
        comments.map((commentView, index) => {
          const { counts } = commentView;
          return (
            <Comment
              key={index}
              commentView={commentView}
              lemmyInstance={activeLemmyInstance}
              commentSort={activeSortType}
              ratioDetector={counts.score}
              isOpen={false}
            />
          );
        })}
    </div>
  );
}

export default HexBear;
