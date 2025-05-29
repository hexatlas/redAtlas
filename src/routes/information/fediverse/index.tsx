import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import LegendLayout from '../../../components/shared/LegendLayout';

export const Route = createFileRoute('/information/fediverse/')({
  component: FediverseHomeComponent,
});

function FediverseHomeComponent() {
  return (
    <LegendLayout route={Route}>
      <h1>
        <span>👥</span> Fediverse
      </h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum provident
        tenetur eum libero. Natus unde architecto non similique, ad minima
        accusamus sapiente officiis. Ipsa at provident, magni velit amet ipsam!
      </p>
      <h2>Instructions</h2>
      <ul className="container dark">
        <li>
          <b>Lemmy</b>
        </li>
        <li>
          <b>Mastodon</b>
        </li>
      </ul>
    </LegendLayout>
  );
}
