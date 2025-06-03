import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import LegendLayout from '../../components/shared/LegendLayout';

export const Route = createFileRoute('/government/')({
  component: GovernmentHomeComponent,
});

function GovernmentHomeComponent() {
  return (
    <LegendLayout route={Route}>
      <h1>
        Government<span>🏛️</span>
      </h1>

      <p>
        This section examines how government structures operate as tools of class rule. It
        highlights the role of state institutions in maintaining power dynamics that favor the class
        in power.
      </p>

      <h2>Instructions</h2>

      <ul className="container dark">
        {' '}
        <li>
          🗺️ <b>Show on Map:</b> Look for 📍 to pinpoint locations of key government institutions,
          corporate headquarters, or areas of state repression. Analyze how these locations reflect
          the concentration of power and the enforcement of capitalist policies.
        </li>{' '}
        <li>
          🔗 <b>Extra Resources:</b> Click for further reading on:
          <ul className="container">
            <li>The role of government in enforcing austerity measures that benefit capital</li>
            <li>Historical examples of state violence against labor movements</li>
            <li>Legislation that prioritizes corporate interests over workers' rights</li>
          </ul>
        </li>{' '}
      </ul>
    </LegendLayout>
  );
}
