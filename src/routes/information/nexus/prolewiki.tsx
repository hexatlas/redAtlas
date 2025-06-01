import React, { useContext } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AtlasContext } from '../../__root';
import useWiki from '../../../data/information/nexus/useWiki';
import LegendLayout from '../../../components/shared/LegendLayout';

export const Route = createFileRoute('/information/nexus/prolewiki')({
  component: RouteComponent,
});

function RouteComponent() {
  const { activeGeographicIdentifier, activeAdministrativeRegion } = useContext(AtlasContext)!;

  const wikiURL = 'https://en.prolewiki.org';
  const isProleWiki = true;

  const { wikiData, isLoading } = useWiki(
    activeAdministrativeRegion,
    activeGeographicIdentifier,
    isProleWiki,
  );

  return (
    <LegendLayout route={Route}>
      <>
        <h1>
          <span></span>ProleWiki
        </h1>

        <>
          <p>
            Please consider contributing knowledge on{' '}
            <a
              href={`https://en.prolewiki.org/?search=${encodeURI(
                activeAdministrativeRegion[activeGeographicIdentifier] as string,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {activeAdministrativeRegion[activeGeographicIdentifier]} on {wikiURL}
            </a>
          </p>

          <a
            href={`https://en.prolewiki.org/wiki/Category:Library_works_about_${encodeURI(
              activeAdministrativeRegion?.country,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            📚📕 All library works about {activeAdministrativeRegion?.country} on ProleWiki.
          </a>
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
