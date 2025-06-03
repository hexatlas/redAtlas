import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import LegendLayout from '../../components/shared/LegendLayout';

export const Route = createFileRoute('/government/class')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LegendLayout route={Route}>
      <h1>
        Class Structure<span>🎩</span>
      </h1>
      <h6 className="container warning">
        TO DO: LINK DISCUSSION THREAD TO EVENTUALLY FILL WITH REAL DATA
      </h6>

      <h2>Industrialists</h2>
      <table>
        <thead>
          <tr>
            <th>Subclass</th>
            <th>Description</th>
            <th>Composition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Capitalist Owners</td>
            <td>Owners and controllers of large-scale industries</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, holding significant political power and influence
            </td>
          </tr>
          <tr>
            <td>Managers</td>
            <td>Upper-level management in industrial enterprises</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, shaping economic policies and strategies
            </td>
          </tr>
        </tbody>
      </table>
      <h2>Finance Capitalists</h2>
      <table>
        <thead>
          <tr>
            <th>Subclass</th>
            <th>Description</th>
            <th>Composition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Investment Bankers</td>
            <td>
              Individuals and institutions involved in financial investment and capital allocation
            </td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, wielding significant influence in global finance and markets
            </td>
          </tr>
          <tr>
            <td>Stock Traders</td>
            <td>Professionals trading stocks and securities in financial markets</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, participating actively in stock exchanges and investment firms
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Landowners</h2>
      <table>
        <thead>
          <tr>
            <th>Subclass</th>
            <th>Description</th>
            <th>Composition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nobility</td>
            <td>Traditional aristocratic families with vast land</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, wielding considerable influence in political and social circles
            </td>
          </tr>
          <tr>
            <td>Gentry</td>
            <td>Wealthy landowners from commerce or investment</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, controlling extensive land holdings and participating in elite
              societies
            </td>
          </tr>
          <tr>
            <td>Tenants</td>
            <td>Farmers and tenants leasing land for agriculture</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, contributing to agricultural production under the patronage of
              landowners
            </td>
          </tr>
        </tbody>
      </table>
      <h2>Intelligentsia</h2>
      <table>
        <thead>
          <tr>
            <th>Subclass</th>
            <th>Description</th>
            <th>Composition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Professionals</td>
            <td>Educated individuals in medicine, law, academia</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, shaping intellectual discourse and driving advancements in
              various fields
            </td>
          </tr>
          <tr>
            <td>Artists and Writers</td>
            <td>Creative professionals contributing to culture</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, influencing artistic movements and cultural trends
            </td>
          </tr>
          <tr>
            <td>Clergy</td>
            <td>Religious leaders and scholars engaged in faith</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, guiding spiritual and philosophical beliefs
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Armed Forces</h2>
      <table>
        <thead>
          <tr>
            <th>Subclass</th>
            <th>Description</th>
            <th>Composition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Officers</td>
            <td>Commissioned military personnel and commanders</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, holding key positions in national defense and security
            </td>
          </tr>
          <tr>
            <td>Enlisted Personnel</td>
            <td>Non-commissioned soldiers serving in military</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, comprising the backbone of the armed forces and maintaining peace
              and order
            </td>
          </tr>
          <tr>
            <td>Support Staff</td>
            <td>Civilians providing logistical support to forces</td>
            <td>
              <span className="highlight">{100 * Math.random()}.5%</span>
              of total population, facilitating military operations and infrastructure maintenance
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Bourgeoisie</h2>
      <table>
        <thead>
          <tr>
            <th>Subclass</th>
            <th>Description</th>
            <th>Composition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Entrepreneurs</td>
            <td>Small business owners and self-employed</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, driving innovation and entrepreneurship in various sectors
            </td>
          </tr>
          <tr>
            <td>Professionals</td>
            <td>Middle-class professionals such as doctors, etc</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, contributing expertise to critical sectors such as healthcare and
              law
            </td>
          </tr>
          <tr>
            <td>Skilled Workers</td>
            <td>Tradespeople and craftsmen with specialized skills</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, playing essential roles in construction, manufacturing, and trade
            </td>
          </tr>
        </tbody>
      </table>
      <h2>Proletariat</h2>
      <table>
        <thead>
          <tr>
            <th>Subclass</th>
            <th>Description</th>
            <th>Composition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Factory Workers</td>
            <td>Laborers in factories performing manual tasks</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, forming the working class and advocating for labor rights
            </td>
          </tr>
          <tr>
            <td>Agricultural Laborers</td>
            <td>Farmworkers and seasonal workers in agriculture</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, sustaining agricultural production and rural livelihoods
            </td>
          </tr>
          <tr>
            <td>Urban Poor</td>
            <td>Urban residents facing economic hardship</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, struggling with poverty and socio-economic challenges in urban
              areas
            </td>
          </tr>
          <tr>
            <td>Unskilled Laborers</td>
            <td>Workers without specialized skills or training</td>
            <td>
              <span className="highlight">{100 * Math.random()}%</span>
              of total population, employed in low-wage jobs and facing precarious employment
              conditions
            </td>
          </tr>
        </tbody>
      </table>
    </LegendLayout>
  );
}
