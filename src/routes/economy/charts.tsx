import { createFileRoute } from '@tanstack/react-router';
import React, { useContext, useState, useEffect, useRef } from 'react';

import * as d3 from 'd3';

// https://www.radix-ui.com/primitives/docs/components/collapsible
import * as Collapsible from '@radix-ui/react-collapsible';

import { AtlasContext } from '../__root';
import useIMF from '../../data/economy/charts/useIMF';
import { IMFIndicatorType } from '../../types/api.types';
import LegendLayout from '../../components/shared/LegendLayout';

export const Route = createFileRoute('/economy/charts')({
  component: ChartsRouteComponent,
});

function ChartsRouteComponent() {
  const { activeAdministrativeRegion } = useContext(AtlasContext)!;
  const [open, setOpen] = useState(false);

  /*
    useStates
    */

  const { IMFData, isLoading, indicatorsArray, activeIndicator, setActiveIndicator } = useIMF(
    activeAdministrativeRegion,
  );

  const { name, label, description, source, unit, dataset } = activeIndicator;

  /*
      useEffects
      */

  // Transfroms, filters and sorts IMF Indicators JSON

  const LineChart = ({ data }: { data }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
      const margin = { top: 20, right: 30, bottom: 50, left: 50 };
      const width = 600 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      // Clear existing SVG content
      d3.select(svgRef.current).selectAll('*').remove();

      const svg = d3
        .select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr(
          'viewBox',
          `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom * 2}`,
        )
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear().domain([1980, 2028]).range([0, width]);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(Object.values(data))])
        .nice()
        .range([height, 0]);

      const line = d3
        .line()
        .x((d) => x(d.year))
        .y((d) => y(d.value));

      const chartData = Object.entries(data).map(([year, value]) => ({
        year: parseInt(year),
        value,
      }));

      // Add X axis with label
      svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('d')))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('color', 'var(--text-atlas-body)')
        .style('text-anchor', 'end');

      // Add X axis label
      svg
        .append('text')
        .attr('class', 'x-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 5)
        .text('Year')
        .style('fill', 'var(--text-atlas-heading)')
        .style('font-size', 'var(--size-atlas-09)');

      // Add Source
      svg
        .append('text')
        .attr('class', 'x-label')
        .attr('x', 0)
        .attr('y', height + margin.bottom * 1.312)
        .text(`${String(source).toUpperCase()} | data.imf.org`)
        .style('fill', 'var(--text-atlas-body)')
        .style('font-size', 'var(--size-atlas-09)');

      // Add Y axis with label
      svg.append('g').call(d3.axisLeft(y));

      // Add Y axis label
      svg
        .append('text')
        .attr('class', 'y-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 12)
        .attr('x', -height / 2)
        .text(unit)
        .style('fill', 'var(--text-atlas-heading)')
        .style('font-size', 'var(--size-atlas-09)');

      // Add chart title (optional)
      svg
        .append('text')
        .attr('class', 'chart-title')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .text(`${activeAdministrativeRegion?.country.toUpperCase()} | ${label}`)
        .style('fill', 'var(--text-atlas-heading)')
        .style('font-size', 'var(--size-atlas-09)')
        .style('font-weight', 'bold');

      // Add horizontal grid lines
      svg
        .append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''))
        .style('stroke-dasharray', '2,2')
        .style('fill', 'var(--surface-atlas-chart)')
        .style('stroke-opacity', 'var(--opacity-atlas-2)');

      // Add vertical grid lines
      svg
        .append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(-height).tickFormat(''))
        .style('stroke-dasharray', '2,2')
        .style('stroke-opacity', 'var(--opacity-atlas-1)');

      svg
        .append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'var(--surface-atlas-info-active)')
        .attr('stroke-width', 1.312)
        .attr('d', line);

      // Create tooltip
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'var(--surface-atlas-info-active)')
        .style('color', 'var(--text-atlas-info)')
        .style('padding', 'var(--size-atlas-09)')
        .style('border-radius', 'var(--border-radius-atlas-1)')
        .style('font-size', 'var(--size-atlas-09)')
        .style('pointer-events', 'none')
        .style('opacity', 0);

      // Add vertical and horizontal helper lines
      const verticalLine = svg
        .append('line')
        .attr('class', 'helper-line')
        .style('stroke', 'var(--surface-atlas-info-active)')
        .style('stroke-dasharray', '2,2')
        .style('opacity', 0);

      const horizontalLine = svg
        .append('line')
        .attr('class', 'helper-line')
        .style('stroke', 'var(--surface-atlas-info-active)')
        .style('stroke-dasharray', '2,2')
        .style('opacity', 0);

      // Add points with hover effects
      svg
        .selectAll('circle')
        .data(chartData)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.year))
        .attr('cy', (d) => y(d.value))
        .attr('r', 'var(--size-atlas-14)')
        .attr('fill', 'var(--surface-atlas-info-active)')
        .on('mouseover', function (event, d) {
          // const [mouseX, mouseY] = d3.pointer(event);

          // Show tooltip
          tooltip
            .style('opacity', 1)
            .html(`${d.value} ${unit} in ${d.year}`)
            .style('left', event.pageX - 10 + 'px')
            .style('top', event.pageY + 10 + 'px')
            .style('z-index', '9999');

          // Show helper lines
          verticalLine
            .attr('x1', x(d.year))
            .attr('y1', 0)
            .attr('x2', x(d.year))
            .attr('y2', height)
            .style('opacity', 1);

          horizontalLine
            .attr('x1', 0)
            .attr('y1', y(d.value))
            .attr('x2', width)
            .attr('y2', y(d.value))
            .style('opacity', 1);

          // Highlight point
          d3.select(this)
            .attr('r', 'var(--size-atlas-09)')
            .attr('fill', 'var(--surface-atlas-info-active)');
        })
        .on('mouseout', function () {
          // Hide tooltip
          tooltip.style('opacity', 0);

          // Hide helper lines
          verticalLine.style('opacity', 0);
          horizontalLine.style('opacity', 0);

          // Reset point
          d3.select(this)
            .attr('r', 'var(--size-atlas-14)')
            .attr('fill', 'var(--surface-atlas-info-active)');
        });

      svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('d')))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      svg.append('g').call(d3.axisLeft(y));

      // Cleanup function
      return () => {
        svg.selectAll('*').remove();
        tooltip.remove();
      };
    }, [data]);

    return <svg ref={svgRef}></svg>;
  };

  const YearsList = ({ data, indicator, country }: { data; indicator: { name }; country }) => {
    const { name } = indicator;

    // Check if the indicator.name and country exist in the data
    if (!data[name] || !data[name][country] || data === undefined) {
      return <>{!isLoading && <div>No data available for the specified name and country.</div>}</>;
    }

    // Extracting years and values from the object
    const yearsData = data[name][country];
    const years = Object.keys(yearsData);
    const [open, setOpen] = useState(false);
    return (
      <>
        <LineChart data={yearsData} />
        <Collapsible.Root className="CollapsibleRoot" open={open} onOpenChange={setOpen}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              // justifyContent: "space-between",
            }}
          >
            <Collapsible.Trigger asChild>
              <button
                className="emoji"
                role="button"
                aria-label={open ? 'Hide information' : 'Show more Information'}
              >
                {open ? 'x' : 'ⓘ'}
              </button>
            </Collapsible.Trigger>
            <span className="Text">
              <p>Show Table</p>
            </span>
          </div>

          <Collapsible.Content>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>{unit}</th>
                </tr>
              </thead>
              <tbody>
                {years.map((year) => (
                  <tr
                    key={year}
                    className={Number(year) === new Date().getFullYear() ? 'highlight' : ''}
                  >
                    <td>{year}</td>
                    <td>
                      <strong>
                        {yearsData[year].toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Collapsible.Content>
        </Collapsible.Root>
      </>
    );
  };

  return (
    <LegendLayout route={Route}>
      <div className="">
        <h1>
          Charts <span>📈</span>
        </h1>
        <h2>Where does line go? </h2>
        <select
          className="option"
          value={activeIndicator?.name}
          onChange={(e) => {
            return setActiveIndicator(
              indicatorsArray.find(
                (indicator) => indicator.name === e.target.value,
              ) as IMFIndicatorType,
            );
          }}
        >
          {indicatorsArray.map((indicator, index) => (
            <option key={index} className="dropdown-menu-radio-item" value={indicator.name}>
              {indicator.label}
            </option>
          ))}
        </select>
      </div>
      {isLoading && <p className="map-info__loading-emoji">🔍</p>}

      {IMFData && (
        <div className="container">
          <YearsList
            data={IMFData}
            indicator={activeIndicator}
            country={activeAdministrativeRegion['ISO3166-3']}
          />
        </div>
      )}

      <Collapsible.Root className="CollapsibleRoot" open={open} onOpenChange={setOpen}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Collapsible.Trigger asChild>
            <button
              className="button-emoji"
              aria-label={open ? 'Hide information' : 'Show more Information'}
            >
              {open ? 'x' : 'ⓘ'}
            </button>
          </Collapsible.Trigger>
        </div>
        <div className="indicator-name">
          <span className="Text">
            <strong>Description of </strong> {name}
          </span>
        </div>
        <Collapsible.Content>
          {description && (
            <p>
              <strong>Description:</strong> {description}
            </p>
          )}
          <p>
            <strong>Source:</strong> {source}
          </p>
          <p>
            <strong>Dataset:</strong> {dataset}
          </p>
        </Collapsible.Content>
      </Collapsible.Root>
    </LegendLayout>
  );
}
