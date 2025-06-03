import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import LegendLayout from '../../../components/shared/LegendLayout';

export const Route = createFileRoute('/information/map/')({
  component: MapHomeComponent,
});

function MapHomeComponent() {
  return (
    <LegendLayout route={Route}>
      <h1>
        MAP Index <span>🌐</span>
      </h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum provident tenetur eum libero.
        Natus unde architecto non similique, ad minima accusamus sapiente officiis. Ipsa at
        provident, magni velit amet ipsam!
      </p>
      <h2>Instructions</h2>
      <ul className="container dark">
        <li>
          <b>🔗 External Resources:</b> Click to access additional information from sources like
          Comtrade, ILOSTAT, and World Bank.
        </li>
        <li>
          <b>🌐 Economic Locations:</b> Use to explore Energy, Industrial, or Transport locations on
          the map.
          <ul className="container">
            <li>
              🏛️ <b>Embassy</b>
            </li>
          </ul>
        </li>
        <li>
          <b>📈 Economic Data:</b> View economic charts and graphs to understand trends and
          patterns.
        </li>
      </ul>
    </LegendLayout>
  );
}
