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
    { value: 'system', label: '⚙️ System' },
    { value: 'light', label: '☀️ Light' },
    { value: 'dark', label: '🌙 Dark' },
    { value: 'red', label: '✊ Red' },
    { value: 'lgbtq', label: '🏳️‍🌈 LGBTQ' },
    { value: 'antifa', label: '🏴 Antifa' },
    { value: 'retro', label: '💾 Retro' },
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
    <LegendLayout
      route={Route}
      footer={
        <section id="credits">
          <ul className="wrapper">
            <li>
              <a href="https://hexbear.net" target="_blank" rel="noopener noreferrer">
                <img src={hexbear} alt="Lemmy Logo" className="custom-icon" />{' '}
              </a>
            </li>

            <li>
              <a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">
                <img src={leaflet} alt="Leaflet Logo" className="custom-icon" />{' '}
              </a>
            </li>
            <li>
              <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer">
                <img src={openstreetmap} alt="OpenStreetMaps Logo" className="custom-icon" />{' '}
              </a>
            </li>
            <li>
              <a href="https://prolewiki.org" target="_blank" rel="noopener noreferrer">
                <img src={prolewiki} alt="ProleWiki Logo" className="custom-icon" />{' '}
              </a>
            </li>

            <li>
              <a href="https://github.com/LemmyNet" target="_blank" rel="noopener noreferrer">
                <img src={lemmy} alt="Lemmy Logo" className="custom-icon" />{' '}
              </a>
            </li>

            <li>
              <a href="https://chat.deepseek.com" target="_blank" rel="noopener noreferrer">
                <img src={deepseek} alt="deepseek Logo" className="custom-icon" />{' '}
              </a>
            </li>

            <li>
              <a href="https://ollama.com" target="_blank" rel="noopener noreferrer">
                <img src={ollamaLogo} alt="ollama Logo" className="custom-icon" />{' '}
              </a>
            </li>

            <li>
              <a href="https://wikipedia.org" target="_blank" rel="noopener noreferrer">
                <img src={natopedia} alt="Wikipedia Logo" className="custom-icon" />{' '}
              </a>
            </li>

            <li>
              <a href="https://mastodon.social" target="_blank" rel="noopener noreferrer">
                <img src={mastodon} alt="Mastodon Logo" className="custom-icon" />{' '}
              </a>
            </li>
            <li>
              <a href="https://openweather.co.uk" target="_blank" rel="noopener noreferrer">
                <img src={openweather} alt="Openweather Logo" className="custom-icon" />{' '}
              </a>
            </li>
          </ul>
        </section>
      }
    >
      <section className="container hero">
        <h1 className="emoji" title="atlas" aria-label="atlas">
          red🅰️TLAS
        </h1>
        <div className="background">🧭</div>
        <div className="background">🗺️</div>{' '}
      </section>
      {/* INSTRUCTIONS */}
      <section>
        <h2>Instructions</h2>
        <h3>Select Country</h3>
        <p>
          Choose a country, by using search, clicking on the map, or 🎲 for a random pick to analyze
          its tools of state power.
        </p>
        <AtlasLocationSearch />
        <li>
          <h3>State Power Options</h3>
          <div className="wrapper">
            <Link
              search={search}
              className="container option"
              to={'/economy'}
              aria-label={'economy link'}
            >
              💵 Economy
            </Link>

            <Link
              search={search}
              className="container option"
              to={'/information'}
              aria-label={'information link'}
            >
              ℹ️ Information
            </Link>

            <Link
              search={search}
              className="container option"
              to={'/diplomacy'}
              aria-label={'diplomacy link'}
            >
              🕊️ Diplomacy
            </Link>

            <Link
              search={search}
              className="container option"
              to={'/military'}
              aria-label={'security link'}
            >
              🛡️ Military Power
            </Link>

            <Link
              search={search}
              className="container option"
              to={'/government'}
              aria-label={'government link'}
            >
              🏛️ Government
            </Link>
          </div>
        </li>
        <h3>Map Layers 🗺️</h3>

        <p>Switch between satellite, terrain, or boundaries.</p>
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
            {themes.map((theme, index) => (
              <option key={theme.value} value={theme.value} disabled={index > 2}>
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
      {/* ABOUT */}
      <section>
        <h2>About</h2>
        <blockquote>
          "What is now happening to Marx’s theory has, in the course of history, happened repeatedly
          to the theories of revolutionary thinkers and leaders of oppressed classes fighting for
          emancipation. During the lifetime of great revolutionaries, the oppressing classes
          constantly hounded them, received their theories with the most savage malice, the most
          furious hatred and the most unscrupulous campaigns of lies and slander. After their death,
          attempts are made to convert them into harmless icons, to canonize them, so to say, and to
          hallow their names to a certain extent for the “consolation” of the oppressed classes and
          with the object of duping the latter, while at the same time robbing the revolutionary
          theory of its substance, blunting its revolutionary edge and vulgarizing it."
        </blockquote>
        <small>
          ― Vladimir Ilyich Lenin,
          <a
            href={'https://www.marxists.org/archive/lenin/works/1917/staterev/ch01.htm'}
            target="_blank"
            rel="noopener noreferrer"
          >
            The State and Revolution
          </a>
        </small>

        <h3>Features</h3>
        <ul className="wrapper">
          <li className="container neutral">
            <input type="checkbox" name="privacy" title="Get uBlock" checked />
            <label htmlFor="privacy">No Ads</label>
          </li>
          <li className="container neutral">
            <input type="checkbox" name="decentral" checked title="but kinda centralized as well" />
            <label htmlFor="decentral">Decentralized</label>
          </li>
          <li className="container neutral">
            <input type="checkbox" name="self" checked title="Resilience" />
            <label htmlFor="self">Self-Hostable</label>
          </li>
          <li className="container neutral">
            <input type="checkbox" name="FOSS" checked title="For the people" />
            <label htmlFor="FOSS">FOSS</label>
          </li>
        </ul>

        <h3>Development</h3>
        <div className="wrapper">
          <a
            href="https://github.com/hexatlas/redAtlas"
            target="_blank"
            rel="noopener noreferrer"
            className="container action"
          >
            Github
          </a>
          <a
            href="https://codeberg.org/hex_atlas/redAtlas"
            target="_blank"
            rel="noopener noreferrer"
            className="container action"
          >
            Codeberg
          </a>
        </div>

        <h3>Discussions</h3>
        <div className="wrapper">
          <a
            href="https://hexbear.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="container action"
          >
            Hexbear.net
          </a>
        </div>
        <p>
          A leftist social platform centered around community building through discussion,
          shitposting memes, and sharing content.
        </p>
      </section>{' '}
      <small className="mute">GNU AFFERO GENERAL PUBLIC LICENSE</small>
    </LegendLayout>
  );
}
