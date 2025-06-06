import { ReactNode } from '@tanstack/react-router';
import React, { useEffect } from 'react';

// https://www.radix-ui.com/primitives/docs/components/collapsible
import * as Collapsible from '@radix-ui/react-collapsible';

import wikidataIcon from '../../assets/icons/wikidata.svg';
import useWikiDataImages from '../../data/shared/useWikiDataImages';

function AtlasOSMInfoDetail({
  activeElement,
  setActiveElement,
  iconMap,
  filterKeys,
  showOnMap,
}: {
  activeElement;
  setActiveElement;
  iconMap;
  filterKeys;
  showOnMap;
}) {
  const { name, wikidata, 'name:en': nameEN, source, website } = activeElement?.tags || {};

  const [imagesArray] = useWikiDataImages(wikidata);

  return (
    <>
      {name && <h2>{name}</h2>}
      {iconMap && filterKeys && (
        <div className="wrapper">
          {/* FILTER EMOJI */}
          <div className="container container--inset info" aria-label={`Filterkey`}>
            {iconMap[activeElement?.tags[filterKeys[0]]]?.options?.html ? (
              <span className="emoji-label" aria-hidden="true">
                {iconMap[activeElement?.tags[filterKeys[0]]]?.options?.html as ReactNode}
              </span>
            ) : (
              <span className="emoji-label" aria-hidden="true">
                {iconMap['defaultIcon']?.options?.html as ReactNode}
              </span>
            )}

            {/* FILTER LABEL */}
            {filterKeys.map((filterKey, index) => {
              if (index > 0) return;
              return (
                <div key={index}>
                  {activeElement?.tags[filterKey] && (
                    <small key={index} aria-label={filterKey}>
                      {activeElement?.tags[filterKey]}
                    </small>
                  )}
                </div>
              );
            })}
          </div>
          {imagesArray && imagesArray.length > 0 && (
            <div className="wikidata__container">
              {imagesArray.map((image, index) => {
                return <img src={image} key={index} alt="WikiData Image" />;
              })}
            </div>
          )}{' '}
        </div>
      )}{' '}
      {wikidata && (
        <a
          href={`https://www.wikidata.org/wiki/${wikidata}`}
          target="_blank"
          rel="noopener noreferrer"
          className="wikidata"
          aria-label="wikidata"
        >
          <img src={wikidataIcon} alt="Wikidata Logo" className="custom-icon" />{' '}
        </a>
      )}
      {nameEN && <small>{nameEN}</small>}{' '}
      <div className="neutral">
        {iconMap && filterKeys && (
          <div className="container info">
            {filterKeys.map((filterKey, index) => {
              if (index < 1) return;
              return (
                <div
                  key={index}
                  aria-label={activeElement?.tags[filterKey]}
                  aria-description={filterKey}
                >
                  {activeElement?.tags[filterKey] && (
                    <div className="wrapper">
                      <b key={index}>{activeElement?.tags[filterKey]}</b>
                      <span>{filterKey}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {source &&
          [...new Set(source.split(';'))].map((url: string, index) => {
            let isUrl;
            try {
              isUrl = new URL(url.toString());
            } catch (error) {
              if (error) return false;
            }
            return (
              <div key={index}>
                {isUrl && (
                  <a key={index} href={isUrl} target="_blank" rel="noopener noreferrer">
                    🔗 {url.toString()}
                  </a>
                )}
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    🔗 {website}
                  </a>
                )}
              </div>
            );
          })}

        <div className="wrapper ">
          <Collapsible.Root>
            <Collapsible.Trigger className="container light" aria-label="toggle details">
              🗃️
            </Collapsible.Trigger>

            <Collapsible.Content className="container light dark">
              <pre>{JSON.stringify(activeElement?.tags, null, 2)}</pre>
            </Collapsible.Content>
          </Collapsible.Root>
          <button onClick={() => setActiveElement(null)} aria-label="close detailview">
            🧹
          </button>
          <button onClick={() => showOnMap(activeElement)}>📍</button>
        </div>
      </div>
    </>
  );
}

export default AtlasOSMInfoDetail;
