import React, { useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import LegendLayout from '../components/shared/LegendLayout';
import { useStateStorage } from '../hooks/useUtils';
import AtlasLocationSearch from '../components/shared/LocationSearch';

import leaflet from '../assets/icons/leaflet.svg';
import openstreetmap from '../assets/icons/openstreetmap.svg';
import openweather from '../assets/icons/openweather.svg';
import hexbear from '../assets/icons/hexbear.svg';
import lemmy from '../assets/icons/lemmy.svg';
import mastodon from '../assets/icons/mastodon.svg';
import prolewiki from '../assets/icons/prolewiki.png';
import natopedia from '../assets/icons/natopedia.svg';
import ollamaLogo from '../assets/icons/ollama.png';
import deepseek from '../assets/icons/deepseek.svg';

export const Route = createFileRoute('/')({
  component: AtlasHomeComponent,
});

function AtlasHomeComponent() {
  const [currentTheme, setCurrentTheme] = useStateStorage<string>('AtlasTheme', 'system', true);

  const themes = [
    { value: 'dark', label: '🌙 Dark' },
    { value: 'light', label: '☀️ Light' },
    { value: 'red', label: '✊ Red' },
    { value: 'old', label: '🧭 Old' },
    { value: 'system', label: '⚙️ System' },
  ];

  // Effect to handle theme changes
  useEffect(() => {
    updateTheme();
  }, [currentTheme]);

  // Update Theme in DOM

  const updateTheme = () => {
    const body = document.querySelector('body');

    if (currentTheme === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body?.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        body?.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      body?.setAttribute('data-theme', currentTheme);
    }
  };

  // Theme change handler
  const handleThemeChange = (event) => {
    setCurrentTheme(event.target.value);
  };

  const search = Route.useSearch();

  return (
    <LegendLayout route={Route}>
      <section className="container hero">
        <h1 className="emoji" title="atlas" aria-label="atlas">
          red🅰️TLAS
        </h1>
        <div className="background">🗺️</div>
      </section>

      {/* INSTRUCTIONS */}
      <section>
        <h2>Instructions</h2>
        <ul className="container">
          <li>
            <b>Select Country:</b> Choose a country, by using search, clicking on the map, or 🎲 for
            a random pick to analyze its tools of state power.
            <AtlasLocationSearch />
          </li>

          <li>
            <b>State Power Options:</b>
            <ul className="wrapper">
              <li className="container option">
                💵{' '}
                <Link
                  search={search}
                  className="legend__link"
                  to={'/economy'}
                  aria-label={'economy link'}
                >
                  Economy
                </Link>
              </li>
              <li className="container option">
                ℹ️{' '}
                <Link
                  search={search}
                  className="legend__link"
                  to={'/information'}
                  aria-label={'information link'}
                >
                  Information
                </Link>
              </li>
              <li className="container option">
                🕊️{' '}
                <Link
                  search={search}
                  className="legend__link"
                  to={'/diplomacy'}
                  aria-label={'diplomacy link'}
                >
                  Diplomacy
                </Link>
              </li>
              <li className="container option">
                🛡️{' '}
                <Link
                  search={search}
                  className="legend__link"
                  to={'/military'}
                  aria-label={'security link'}
                >
                  Military Power
                </Link>
              </li>
              <li className="container option">
                🏛️{' '}
                <Link
                  search={search}
                  className="legend__link"
                  to={'/government'}
                  aria-label={'government link'}
                >
                  Government
                </Link>
              </li>
            </ul>
          </li>
          <li>
            🗺️ <b>Map Layers:</b> Switch between satellite, terrain, or boundaries.
          </li>
        </ul>
      </section>

      {/* THEME */}
      <section>
        <h2>Theme</h2>
        <div className="theme-selector">
          <label htmlFor="theme-select" className="sr-only">
            Select:{' '}
          </label>
          <select
            id="theme-select"
            value={currentTheme}
            onChange={handleThemeChange}
            className="theme-select option"
          >
            {themes.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        <blockquote className="container light">
          <i className="action">Attention:</i> Select an{' '}
          <span className="option">
            <i>option</i>
          </span>{' '}
          to reveal{' '}
          <span className="info">
            <i>selected information</i>
          </span>
          .
        </blockquote>
      </section>

      {/* POWERED BY */}
      <section id="credits">
        <small>Powered by:</small>
        <ul className="wrapper">
          <li>
            <a
              className="wrapper"
              href="https://hexbear.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={hexbear} alt="Lemmy Logo" className="custom-icon" />{' '}
            </a>
          </li>

          <li>
            <a
              className="wrapper"
              href="https://leafletjs.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={leaflet} alt="Leaflet Logo" className="custom-icon" />{' '}
            </a>
          </li>
          <li>
            <a
              className="wrapper"
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={openstreetmap} alt="OpenStreetMaps Logo" className="custom-icon" />{' '}
            </a>
          </li>
          <li>
            <a
              className="wrapper"
              href="https://prolewiki.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={prolewiki} alt="ProleWiki Logo" className="custom-icon" />{' '}
            </a>
          </li>

          <li>
            <a
              className="wrapper"
              href="https://github.com/LemmyNet"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={lemmy} alt="Lemmy Logo" className="custom-icon" />{' '}
            </a>
          </li>

          <li>
            <a
              className="wrapper"
              href="https://chat.deepseek.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={deepseek} alt="deepseek Logo" className="custom-icon" />{' '}
            </a>
          </li>

          <li>
            <a
              className="wrapper"
              href="https://ollama.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={ollamaLogo} alt="ollama Logo" className="custom-icon" />{' '}
            </a>
          </li>

          <li>
            <a
              className="wrapper"
              href="https://wikipedia.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={natopedia} alt="Wikipedia Logo" className="custom-icon" />{' '}
            </a>
          </li>

          <li>
            <a
              className="wrapper"
              href="https://mastodon.social"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={mastodon} alt="Mastodon Logo" className="custom-icon" />{' '}
            </a>
          </li>
          <li>
            <a
              className="wrapper"
              href="https://openweather.co.uk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={openweather} alt="Openweather Logo" className="custom-icon" />{' '}
            </a>
          </li>
        </ul>
      </section>
    </LegendLayout>
  );
}
