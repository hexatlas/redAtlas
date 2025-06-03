import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import LegendLayout from '../../components/shared/LegendLayout';

export const Route = createFileRoute('/diplomacy/')({
  component: DiplomacyHomeComponent,
});

function DiplomacyHomeComponent() {
  return (
    <LegendLayout route={Route}>
      <h1>
        Diplomacy<span>🕊️</span>
      </h1>

      <p>
        This section provides tools for an analysis of diplomatic interactions through a Marxist
        lens, focusing on the interplay between economic structures and geopolitical relationships.
        The following points highlight key contradictions and class dynamics that underpin
        international diplomacy.
      </p>

      <h2>Key Contradictions in Diplomatic Relations</h2>

      <ul className="wrapper">
        <li>
          <h3>Capital vs Labor:</h3> Explore the global class struggle and its impact on
          international relations. The exploitation of labor in developing nations often creates
          tensions between industrialized powers and emerging economies.
        </li>

        <li>
          <h3>Imperialism and Global Power Struggles:</h3> Analyze how capitalist nations compete
          for control over resources and markets, leading to geopolitical conflicts and diplomatic
          crises.
        </li>

        <li>
          <h3>Economic Inequality:</h3> Examine the role of economic disparities in shaping foreign
          policy. Wealthy nations often impose trade policies that favor their interests while
          exploiting poorer countries.
        </li>
      </ul>

      <h2>Material Context and Historical Analysis</h2>

      <p>
        The Marxist perspective on diplomacy emphasizes the material conditions that drive
        international conflict. By examining historical examples such as colonialism, trade
        imbalances, and resource extraction, we can better understand how economic systems shape
        geopolitical relations.
      </p>

      <h2>Menu</h2>

      <ul className="container dark">
        {' '}
        <li>
          🌐 <b>Show on Map:</b> Look for 📍 to pinpoint locations.{' '}
        </li>{' '}
        <li>
          🔗 <b>Extra Resources:</b> Click for further reading.{' '}
        </li>
      </ul>
    </LegendLayout>
  );
}
