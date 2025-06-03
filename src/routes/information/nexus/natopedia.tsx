import React, { useContext } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AtlasContext } from '../../__root';
import useWiki from '../../../data/information/nexus/useWiki';
import LegendLayout from '../../../components/shared/LegendLayout';

export const Route = createFileRoute('/information/nexus/natopedia')({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeGeographicIdentifier, activeAdministrativeRegion } = useContext(AtlasContext)!;

  const wikiURL = 'https://en.wikipedia.org/w';
  const isProleWiki = false;

  const { wikiData, isLoading } = useWiki(
    activeAdministrativeRegion,
    activeGeographicIdentifier,
    isProleWiki,
  );

  return (
    <LegendLayout route={Route}>
      <>
        <h1>
          Natopedia<span></span>
        </h1>
        <>
          <p>
            Please consider providing context on{' '}
            <a
              href={`${wikiURL}?search=${encodeURI(
                activeAdministrativeRegion[activeGeographicIdentifier] as string,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {activeAdministrativeRegion[activeGeographicIdentifier]} on {wikiURL}
            </a>
          </p>
        </>
        <hr />
        <br />
        {isLoading && <p className="map-info__loading-emoji">🔍</p>}
        {wikiData && (
          <>
            <h3>{wikiData.title}</h3>
            <div
              className="prolewiki"
              dangerouslySetInnerHTML={{ __html: wikiData?.text['*'] }}
            ></div>
          </>
        )}
      </>
      <div className="legend__footer">
        <a
          href={`${wikiURL}?search=${encodeURI(
            activeAdministrativeRegion[activeGeographicIdentifier] as string,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View more on {wikiURL}
        </a>
      </div>
    </LegendLayout>
  );
}
