import React, { useContext } from 'react';
import { createFileRoute } from '@tanstack/react-router';

// Context
import { AtlasContext } from '../../__root';

// Data
import useAnarachistLibrary from '../../../data/information/nexus/useAnarachistLibrary';

// Lemmy
import HexBear from '../../../components/shared/HexBear';
import LegendLayout from '../../../components/shared/LegendLayout';

export const Route = createFileRoute('/information/nexus/anarchistlibrary')({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeAdministrativeRegion, activeGeographicIdentifier } =
    useContext(AtlasContext)!;

  const { anarchistLibraryPosts, isLoading } = useAnarachistLibrary(
    activeAdministrativeRegion,
    activeGeographicIdentifier,
  );

  return (
    <LegendLayout route={Route}>
      <h3>Anarchist Library</h3>
      <a
        href={`https://theanarchistlibrary.org/search?query=${encodeURI(
          activeAdministrativeRegion[activeGeographicIdentifier] as string,
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        📚📕 Books about{' '}
        {activeAdministrativeRegion?.country != 'country' &&
          activeAdministrativeRegion[activeGeographicIdentifier]}
      </a>

      {isLoading && <p className="map-info__loading-emoji">🔍</p>}

      {anarchistLibraryPosts?.length > 0 && (
        <>
          {anarchistLibraryPosts &&
            anarchistLibraryPosts.map((book, index) => {
              return (
                <div className="anarchist-library-item" key={index}>
                  <p className="anarchist-library-publish-date ">
                    🗓️ {new Date(book.pubdate_iso).toDateString()}
                  </p>
                  <h4 className="anarchist-library-link">{book.title}</h4>
                  {book.author && (
                    <p className="anarchist-library-author highlight">
                      👤 {book.author}
                    </p>
                  )}
                  {book.subtitle && <p>ℹ️ {book.subtitle}</p>}
                  {book.feed_teaser && (
                    <details>
                      <summary className="view-more">Show More</summary>
                      <div
                        dangerouslySetInnerHTML={{ __html: book.feed_teaser }}
                      ></div>
                    </details>
                  )}
                  <div className="anarchist-library-container">
                    <a
                      className="anarchist-library-readmore"
                      href={book.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read {book.text_type}
                    </a>
                    {book.pages_estimated && (
                      <span>~{book.pages_estimated} 📄</span>
                    )}
                  </div>
                  <HexBear query={book.author}>
                    Search Author on hexbear.net
                  </HexBear>
                </div>
              );
            })}
        </>
      )}
    </LegendLayout>
  );
}
