import React from 'react';
// https://www.radix-ui.com/primitives/docs/components/accordion
import * as Collapsible from '@radix-ui/react-collapsible';
import { ReactNode } from '@tanstack/react-router';

function AtlasOSMInfoFilter({
  data,
  selectedFilters,
  setSelectedFilters,
  filteredData,
  iconMap,
  filterKeys,
}: {
  data;
  selectedFilters;
  setSelectedFilters;
  filteredData;
  iconMap;
  filterKeys;
}) {
  // Extract unique options for each filterKey from data
  const getFilterOptions = (key) => {
    const options = new Set();
    data?.elements.forEach((element) => {
      if (element?.tags[key]) {
        options.add(element?.tags[key]);
      }
    });
    return Array.from(options).sort(); // Convert Set to Array for dropdown
  };

  // Update selected filter for a specific key
  const handleFilterChange = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <>
      {data && (
        <Collapsible.Root>
          <p>
            {filteredData.length}{' '}
            {Object.entries(selectedFilters).map(([key, value]) => {
              if (!value) return true; // No filter applied for this key
              return `${
                iconMap && iconMap[value as string] != undefined
                  ? (iconMap[value as string]?.options?.html as ReactNode)
                  : ''
              } ${value} `; // Element must match the filter
            })}{' '}
          </p>
          <Collapsible.Trigger className="filter-title emoji-label">🎚️</Collapsible.Trigger>
          <Collapsible.Content
            className="filter-menu"
            aria-label={`Filter options ${name}`}
            role="toolbar"
          >
            {filterKeys &&
              filterKeys.map((key, index) => (
                <div key={index} className="filter-field" aria-label={`${key} filter option`}>
                  <label htmlFor={key} className="sr-only">
                    {getFilterOptions(key).length}
                  </label>
                  <select
                    id={key}
                    value={selectedFilters[key] || ''}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    aria-controls="list"
                    className="option"
                  >
                    <option value="" className="filter-field-reset" defaultChecked>
                      ({getFilterOptions(key).length}) {key}
                    </option>
                    {getFilterOptions(key).map((option: string, index) => (
                      <option key={index} value={option.toString()}>
                        {iconMap && (iconMap[option]?.options?.html as ReactNode)}{' '}
                        {option.toString()}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </Collapsible.Content>{' '}
        </Collapsible.Root>
      )}
    </>
  );
}

export default AtlasOSMInfoFilter;
