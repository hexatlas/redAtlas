import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import LegendLayout from '../../components/shared/LegendLayout';

export const Route = createFileRoute('/economy/')({
  component: EconomyHomeComponent,
});

function EconomyHomeComponent() {
  return (
    <LegendLayout route={Route}>
      <h1>
        <span>💵</span> Economy
      </h1>

      <p>
        This section provides tools for a critical analysis of global economic
        structures through a Marxist lens. Examine how capitalism drives
        inequality, exploitation, and class struggle while utilizing data from
        reputable sources like IMF, Comtrade, ILOSTAT, and World Bank to reveal
        the underlying dynamics of wealth accumulation and labor oppression.
      </p>

      <h2>Instructions</h2>

      <ul className="container dark">
        <li>
          <b>🔗 External Resources:</b> Access additional information from
          sources like Comtrade, ILOSTAT, and World Bank to analyze global trade
          patterns, labor conditions, and wealth distribution. Use these
          resources to explore how capitalist economies exploit peripheral
          nations for raw materials and cheap labor.
        </li>

        <li>
          <b>🌐 Economic Locations:</b> Explore key industrial, energy, and
          transport locations on the map through a Marxist critique:
          <ul className="container">
            <li>
              🏭 <b>Industry:</b> Analyze how multinational corporations exploit
              cheap labor in developing nations while maintaining monopolies in
              developed countries.
            </li>
            <li>
              ⚡ <b>Energy:</b> Investigate the role of fossil fuel extraction
              and energy imperialism in global economic inequality.
            </li>
          </ul>
        </li>

        <li>
          <b>📈 Economic Data:</b> Where does the line go?
        </li>
      </ul>
    </LegendLayout>
  );
}
