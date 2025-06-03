import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import LegendLayout from '../../components/shared/LegendLayout';

export const Route = createFileRoute('/military/')({
  component: MilitaryHomeComponent,
});

function MilitaryHomeComponent() {
  return (
    <LegendLayout route={Route}>
      <h1>
        Military<span>🛡️</span>
      </h1>
      <p>
        This section examines how military power is used to enforce capitalist interests and
        maintain global economic dominance. It highlights the role of armed forces in suppressing
        dissent, controlling territories, and ensuring access to resources for capital accumulation.
      </p>

      <h2>Instructions</h2>

      <ul className="container dark">
        {' '}
        <li>
          🗺️ <b>Show on Map:</b> Look for 📍 to pinpoint locations of military bases, resource
          extraction sites, or areas of geopolitical conflict. Analyze how these locations reflect
          imperialist strategies and the enforcement of capitalist interests.
        </li>
        <li>
          🔗 <b>Extra Resources:</b> Click for further reading on:
          <ul className="container">
            <li>Historical examples of military interventions to protect capitalist interests</li>
            <li>The role of arms trade in perpetuating global inequality</li>
            <li>
              Case studies of military suppression of labor movements and anti-capitalist uprisings
            </li>
          </ul>
        </li>
      </ul>
    </LegendLayout>
  );
}
