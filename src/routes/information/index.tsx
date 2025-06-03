import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import LegendLayout from '../../components/shared/LegendLayout';

export const Route = createFileRoute('/information/')({
  component: InformationHomeComponent,
});

function InformationHomeComponent() {
  return (
    <LegendLayout route={Route}>
      <h1>
        Information<span>ℹ️</span>
      </h1>

      <p>
        This section examines how information is used as a tool of state power. It highlights the
        role of media, education, and communication systems in shaping public perception, promoting
        state ideology, and silencing dissent.
      </p>

      <h2>Instructions</h2>

      <ul className="container dark">
        {' '}
        <li>
          🗺️ <b>Show on Map:</b> Look for 📍 to pinpoint locations of media outlets, educational
          institutions, or propaganda campaigns. Analyze how these locations reflect the
          concentration of information power and the promotion of capitalist narratives.
        </li>{' '}
        <li>
          🔗 <b>Extra Resources:</b> Click for further reading on:
          <ul className="container">
            <li>The role of corporate media in shaping public opinion</li>
            <li>Historical examples of propaganda campaigns to justify capitalist interests</li>
            <li>Case studies of censorship and suppression of anti-capitalist ideas</li>
          </ul>
        </li>{' '}
      </ul>
    </LegendLayout>
  );
}
