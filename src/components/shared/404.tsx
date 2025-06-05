import React from 'react';
import LegendLayout from './LegendLayout';
import AtlasLocationSearch from './LocationSearch';

function NotFoundComponent({ data }: { data: unknown }) {
  return (
    <LegendLayout>
      <h1 className="error">
        404<span>🚫</span>
      </h1>
      <div className="container">
        <p>The page you're trying to visit does not exist</p>
        <p>Check if the link is correct.</p>
      </div>
      <h2>Don't worry:</h2>
      <p>Find your way back.</p>
      <a href="/" className="container action">
        Home
      </a>
      <h3>Select Country</h3>
      <p>
        Choose a country, by using search, clicking on the map, or 🎲 for a random pick to analyze
        its tools of state power.
      </p>
      <AtlasLocationSearch />
      <li>
        <h3>State Power Options</h3>
        <ul className="wrapper">
          <li className="container option">
            💵{' '}
            <a className="legend__link" href={'/economy'} aria-label={'economy link'}>
              Economy
            </a>
          </li>
          <li className="container option">
            ℹ️{' '}
            <a className="legend__link" href={'/information'} aria-label={'information link'}>
              Information
            </a>
          </li>
          <li className="container option">
            🕊️{' '}
            <a className="legend__link" href={'/diplomacy'} aria-label={'diplomacy link'}>
              Diplomacy
            </a>
          </li>
          <li className="container option">
            🛡️{' '}
            <a className="legend__link" href={'/military'} aria-label={'security link'}>
              Military Power
            </a>
          </li>
          <li className="container option">
            🏛️{' '}
            <a className="legend__link" href={'/government'} aria-label={'government link'}>
              Government
            </a>
          </li>
        </ul>
      </li>
      <code>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </code>
    </LegendLayout>
  );
}

export default NotFoundComponent;
