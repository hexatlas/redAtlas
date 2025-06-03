import React, { useContext, useEffect, useState } from 'react';

// https://www.radix-ui.com/primitives/docs/components/collapsible
import * as Collapsible from '@radix-ui/react-collapsible';

// https://github.com/LemmyNet/lemmy-js-client
// https://join-lemmy.org/api/classes/LemmyHttp.html
import { CommentView, GetComments, LemmyHttp } from 'lemmy-js-client';

import { TimeAgo } from '../../hooks/useDataTransform';
import LemmyUser from './User';
import LemmyCommunity from './Community';
import { AtlasLemmyCommentSortType, AtlasLemmyInstanceType } from '../../types/api.types';
import { InformationContext } from '../../routes/information';
import Markdown from '../shared/Markdown';
import { AtlasContext } from '../../routes/__root';

interface CommentProps {
  commentView: CommentView;
  lemmyInstance: AtlasLemmyInstanceType;
  commentSort?: AtlasLemmyCommentSortType;
  ratioDetector: number;
  commentDepth?: number;
  showUserAvatar?: boolean;
  isOpen?: boolean;
}

function Comment({
  commentView,
  lemmyInstance,
  commentSort = { value: 'New', label: '🆕' },
  ratioDetector, // takes votecount of parent comment
  commentDepth = 0, // 0 = rootlevel / toplevel comment
  showUserAvatar = true,
  isOpen = true,
}: CommentProps) {
  const [open, setOpen] = useState(isOpen);
  const [replies, setReplies] = useState<CommentView[]>();

  const { activeCommunity } = useContext(InformationContext)!;
  const { activeAdministrativeRegion, activeGeographicIdentifier } = useContext(AtlasContext)!;

  function handleReplies() {
    const client: LemmyHttp = new LemmyHttp(lemmyInstance?.baseUrl);

    const form: GetComments = {
      parent_id: commentView?.comment.id,
      max_depth: 1,
      sort: commentSort.value,
    };

    client.getComments(form).then((res) => {
      setReplies(res?.comments);
    });
  }

  useEffect(() => {
    if (commentView?.comment?.deleted) setOpen(false);
  }, [commentView?.comment?.deleted]);

  return (
    <Collapsible.Root
      className={`comment comment__collapsible-root
 ${commentView?.counts.score > ratioDetector && 'post-highlight'}`}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="comment__info-container">
        <Collapsible.Trigger>
          <div
            className="comment__collapsible-trigger
"
          >
            {open ? '⊟' : '⊞'}
          </div>
        </Collapsible.Trigger>
        {/* AVATAR PROFILE PICTURE */}

        <LemmyUser view={commentView} lemmyInstance={lemmyInstance} showInfoCard={showUserAvatar} />

        {commentView?.comment.distinguished && <p className="comment__alert">📌</p>}

        {/* Score Count / Upvotes / Downvotes */}
        <p className="comment__votes">
          {Number(commentView?.counts.downvotes) === 0 || (
            <sup
              className={`post-vote comment__votes--up
`}
            >
              {commentView?.counts.upvotes}
            </sup>
          )}
          <span
            className={`post-vote commment-vote-score post-score-${
              commentView?.counts.score > 0 ? 'positive' : 'negative'
            }`}
          >
            {commentView?.counts.score}
          </span>
          {Number(commentView?.counts.downvotes) === 0 || (
            <sub className={`post-vote comment__votes--down`}>{commentView?.counts.downvotes}</sub>
          )}
        </p>

        {/* Timestamp */}
        <small className="comment__timestamp">
          <TimeAgo dateString={commentView?.comment.published} />
        </small>
      </div>
      <Collapsible.Content>
        <div className="comment__wrapper">
          {/* OP Post */}
          {commentDepth < 1 && (
            <a
              className="post-post"
              href={commentView?.comment.ap_id}
              target="_blank"
              rel="noopener noreferrer"
            >
              <small>{commentView?.post?.name}</small>
            </a>
          )}

          {commentDepth < 1 && activeCommunity?.id != commentView?.community?.id && (
            <LemmyCommunity
              view={commentView}
              lemmyInstance={lemmyInstance}
              showCommunityIcon={activeCommunity?.id != commentView?.community?.id}
            />
          )}
          {commentDepth < 1 && (commentView?.post?.nsfw || commentView?.community?.nsfw) && (
            <p className="comment__alert">NSFW</p>
          )}

          {/* Comment Body */}
          {commentView?.comment?.removed && <p className="comment__body">🚮 Comment removed.</p>}
          {commentView?.comment?.deleted && <p className="comment__body">🗑️ Comment deleted.</p>}
          {!(commentView?.comment?.removed || commentView?.comment?.deleted) &&
            commentView?.comment.content && (
              <Markdown
                className="comment__body"
                highlight={[
                  activeAdministrativeRegion[activeGeographicIdentifier as string],
                  activeAdministrativeRegion.country,
                ]}
              >
                {commentView?.comment.content}
              </Markdown>
            )}

          {/* Replies */}
          <div className={`comment__replies comment__replies--depth-${(commentDepth % 7) + 1}`}>
            {/* Reply Count */}
            {commentView?.counts.child_count > 0 && !replies && (
              <p
                className="comment__reply-button"
                role="button"
                tabIndex={0}
                aria-label="Show Replies"
                onClick={handleReplies}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Space') {
                    handleReplies();
                  }
                }}
              >
                <span className="comment__reply-button__emoji">💬</span>
                {`${commentView?.counts.child_count} repl${
                  commentView?.counts.child_count > 1 ? 'ies' : 'y'
                }`}
              </p>
            )}
          </div>
          {/* Reply Comments */}
          {replies &&
            replies.map((reply, index) => {
              const { comment, creator } = reply;
              if (comment.id == commentView?.comment.id) return; // filter parent commment from API response
              return (
                <Comment
                  key={`${creator.id}${comment.id}${index}`}
                  commentView={reply}
                  lemmyInstance={lemmyInstance}
                  commentDepth={commentDepth + 1}
                  ratioDetector={commentView?.counts.score}
                  commentSort={commentSort}
                />
              );
            })}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export default Comment;
