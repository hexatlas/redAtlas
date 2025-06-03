import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import LegendLayout from '../../../components/shared/LegendLayout';

export const Route = createFileRoute('/information/nexus/')({
  component: NexusHomeComponent,
});

function NexusHomeComponent() {
  return (
    <LegendLayout route={Route}>
      <h1>
        Nexus<span>📚</span>
      </h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum provident tenetur eum libero.
        Natus unde architecto non similique, ad minima accusamus sapiente officiis. Ipsa at
        provident, magni velit amet ipsam!
      </p>
      <h2>Instructions</h2>
      <ul className="container dark">
        <li>
          <b>ProleWiki</b>
        </li>
        <li>
          <b>NATOPedia</b>
        </li>
        <li>
          <b>72Ts Bulletin</b>
        </li>
        <li>
          <b>Anarchist Library</b>
        </li>
      </ul>
    </LegendLayout>
  );
}
