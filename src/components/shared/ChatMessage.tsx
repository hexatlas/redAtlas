import React, { useEffect, useRef, useState } from 'react';

import Markdown from '../../components/shared/Markdown';
import { MessageWithThinking, GeneratedLocations } from '../../types/atlas.types';

import L, { LatLngExpression } from 'leaflet';

import OpenAI from 'openai';
import ollama from 'ollama/browser';
import { useStateStorage } from '../../hooks/useUtils';

async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray.map((b) => ('00' + b.toString(16)).slice(-2)).join('');
  return hashHex;
}

const ChatMessage: React.FC<{
  activeToolModel: string;
  activeReasoningModel: string;
  message: MessageWithThinking;
  highlightArray;
  toolModelConfig?;
  map?;
  loading?;
}> = ({
  activeToolModel,
  activeReasoningModel,
  message,
  highlightArray,
  toolModelConfig,
  map,
  loading,
}) => {
  const [locations, setLocations] = useStateStorage<GeneratedLocations[]>(
    `chat-${message.timestamp}-location`,
    [],
  );

  const clusterGroups = useRef({});

  const [initialLoad, setInitialLoad] = useStateStorage<boolean>(
    `chat-${message.timestamp}-initialLoad`,
    true,
  );
  const [isExctractingLocation, setIsExctractingLocation] = useState(false);

  // useEffect(() => {
  //   if (!loading && initialLoad && locations.length === 0) {
  //     extractLocations();
  //   }
  // }, [loading]);

  const extractLocations = async () => {
    setInitialLoad(false);
    setIsExctractingLocation(true);
    // Mistral tool definition for location extraction
    const locationTool = {
      locations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'mentioned location name',
              required: true,
            },
            nominatim: {
              type: 'string',
              description: 'name optimized for nominatim search query',
              required: true,
            },
            description: {
              type: 'string',
              description:
                'Summary of contextual description of mentioned location. Return table if appropriate',
              required: true,
            },
            emoji: {
              type: 'string',
              description: 'Emoji symbolizing primary contextual theme (e.g., 🏭 for industrial)',
              required: true,
            },
            // New category field added here
            category: {
              type: 'object',
              description: 'Classification of location based on primary function',
              properties: {
                category_emoji: {
                  type: 'string',
                  description: 'Emoji representing category type (e.g., 🏙️ for Industrial)',
                  required: true,
                },
                category_name: {
                  type: 'string',
                  description: 'Formal category name (e.g., "Industrial Center")',
                  required: true,
                },
                category_description: {
                  type: 'string',
                  description: 'Brief explanation of classification rationale',
                  required: true,
                },
              },
              required: ['category_emoji', 'category_name', 'category_description'],
            },
          },
          required: ['name', 'nominatim', 'description', 'emoji', 'category'], // Added category to required
        },
      },
    };

    const locationToolPrompt = JSON.stringify(locationTool);

    const systemPrompt = `
      You will act as a specialized geographic location analyzer to systematically identify, 
      describe, and classify mentions of geographic locations within any provided text. 

      Key Requirements:
      1. For each location, assign exactly ONE category
      2. You should find max. unique 7 abstracted categories. Recatogrize until you have a maximum of 7.
      3. Categorization MUST be:
        - Context-dependent (based on user prompt)
        - Relative to other locations in the same analysis
        - Distinctive (different locations should get different categories when justified) 
      4. If no locations mentioned, return empty

      Analysis Process:
      1. Identify all geographic locations explicitly mentioned or strongly implied
      2. For each location:
        a. Extract core contextual features
        b. Compare against other locations in text
        c. Assign the MOST relevant category
        d. Note: A category may be reused only if contextually justified
      3. Ensure category assignments reflect:
        - Relative importance in the text
        - Functional differences between locations
        - Dominant aspects mentioned

      Output Requirements:
      - Strictly valid JSON matching schema
      - category_name must be unique an treated like an enum
      - Maintain category consistency across similar locations
      - Never invent categories outside that are not contextually relevant

      Required Schema START
      ${locationToolPrompt}
      Required Schema END
    `;

    let LLMlocations = [];

    // OPEN AI
    if (activeToolModel === 'open-ai') {
      const openai = new OpenAI({
        baseURL: toolModelConfig.baseURL,
        apiKey: toolModelConfig.apiKey,
        dangerouslyAllowBrowser: true,
        timeout: 60 * 1000,
      });

      const response = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${message.think} ${message.content}` },
        ],
        model: toolModelConfig.model,
        response_format: {
          type: 'json_object',
          ...locationTool,
        },
        stream: false,
      });

      console.log(response);

      const { locations } = await JSON.parse(response.choices[0].message.content as string);
      LLMlocations = locations;
    }

    // OLLAMA
    if (activeToolModel !== 'open-ai') {
      const response = await ollama.generate({
        model: toolModelConfig.model,
        system: systemPrompt,
        prompt: `${message.think} ${message.content}`,
        format: 'json',
        stream: false,
      });

      const { locations } = await JSON.parse(response.response);
      LLMlocations = locations;
    }
    console.log(LLMlocations);

    setIsExctractingLocation(false);
    setLocations(LLMlocations);
  };

  const showLocationsOnMap = async () => {
    if (locations.length === 0) {
      alert(`
      No Locations to show!

      Step 1: extractLocations 
      Step 2: Wait a few mins until the ToolLLM extracted the Locations 
      Step 3: showLocationsOnMap
      
      If you done that already: Check if LLMao's answer contains locations.
      `);
      return;
    }
    try {
      const LLMboundingbox = L.latLngBounds(
        null as unknown as LatLngExpression,
        null as unknown as LatLngExpression,
      );
      const handleMap = (nominatimResponseArg) => {
        LLMboundingbox.extend([nominatimResponseArg.lat, nominatimResponseArg.lon]);
        console.log(LLMboundingbox);
        map?.flyToBounds(LLMboundingbox, { padding: [100, 100] });
      };

      // Create a new array to store updated locations
      const updatedLocations = [...locations];

      for (let i = 0; i < updatedLocations.length; i++) {
        const location = updatedLocations[i];

        if (typeof location?.nominatimResponse === 'object') {
          const { nominatimResponse } = location;
          createMapPopup(nominatimResponse, updatedLocations[i]);
          handleMap(nominatimResponse);
        } else {
          const { nominatim } = location;
          const nominatimResponse = await getNominatimLocation(nominatim);
          if (!nominatimResponse) continue;

          // Update the location IMMUTABLY
          updatedLocations[i] = {
            ...location,
            nominatimResponse, // Add nominatimResponse to the location
          };

          createMapPopup(nominatimResponse, updatedLocations[i]);
          handleMap(nominatimResponse);
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }

      // Set state with the new array
      setLocations(updatedLocations);
    } catch (error) {
      console.error('Error showing locations:', error);
      // setLocations([]);
    }
  };

  const allMarkersLayer = L.layerGroup().addTo(map);
  // Helper function: Create or get cluster group for a group
  const getClusterGroup = (group_name, group_emoji) => {
    if (!clusterGroups.current[group_name]) {
      clusterGroups.current[group_name] = L.markerClusterGroup({
        polygonOptions: { weight: 1.5, color: '#FFCC0D', opacity: 0.5 },
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `
            <div class="cluster-container">
              <span class="cluster-count accent--invert">${count}</span>
              <span class="cluster-emoji">${group_emoji}</span>
              <div class="cluster-tooltip">${group_name}</div>
            </div>`,
            className: 'cluster-info',
          });
        },
      });
      allMarkersLayer.addLayer(clusterGroups.current[group_name]);
    }
    return clusterGroups.current[group_name];
  };

  const createMapPopup = (nominatimResponse, location) => {
    const {
      name,
      description,
      emoji,
      category: { category_name, category_emoji, category_description },
      nominatimResponse: { display_name },
    } = location;

    const emojiIcon = L.divIcon({
      html: `<div class="marker-info">${emoji}</div>`,
      className: 'emoji-icon',
    });

    const marker = L.marker([nominatimResponse.lat, nominatimResponse.lon], {
      icon: emojiIcon,
    });

    const popupContent = `
    <div>
      <small>🤖 LLMao (${activeToolModel})</small>
      <h1><small>${category_name || 'Unnamed'}</small><span>${category_emoji}</span></h1>
      <p>${category_description}</p>
      <div class="container">
        <h4>${name}<span class="container"> ${emoji}</span></h4>
        <p>${description}</p>
        <small>📍 <span class="mute">${display_name}</span></small>
      </div>
    </div>
    
  `;

    const popup = L.popup().setContent(popupContent);
    marker.bindPopup(popup);

    // Add to appropriate cluster group
    const clusterGroup = getClusterGroup(category_name, category_emoji);
    clusterGroup.addLayer(marker);

    // Add event listener for popup open
    marker.on('popupopen', () => {
      console.log({
        name,
        description,
        emoji,
        category_name,
        category_emoji,
        category_description,
        nominatim: nominatimResponse,
      });
    });

    return marker;
  };

  const getNominatimLocation = async (location) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${location}&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const results = await response.json();
    return results[0]; // return first location search result
  };

  const resetLocations = () => {
    // Clear all cluster groups
    for (const groupName in clusterGroups.current) {
      clusterGroups.current[groupName].clearLayers();
      allMarkersLayer.removeLayer(clusterGroups.current[groupName]);
      delete clusterGroups.current[groupName];
    }

    // Clear any remaining markers
    allMarkersLayer.clearLayers();
    setLocations([]);
  };

  const removeLocationMarkers = () => {
    // Clear all cluster groups
    for (const groupName in clusterGroups.current) {
      clusterGroups.current[groupName].clearLayers();
      allMarkersLayer.removeLayer(clusterGroups.current[groupName]);
      delete clusterGroups.current[groupName];
    }

    // Clear any remaining markers
    allMarkersLayer.clearLayers();
  };

  return (
    <div className={`${message.role === 'user' && 'container chat__user '}`}>
      <span className="">
        {message.role === 'user' ? '🚩' : !message.finishedThinking ? '⏳' : '🤖'}

        <span>
          {message.role === 'user'
            ? 'You'
            : `LLMao (${activeReasoningModel || toolModelConfig.model})`}
        </span>
      </span>
      <span className="mute">{message.timestamp}</span>
      {message.role === 'assistant' && (
        <details open={!message.finishedThinking} className="thoughts">
          <summary>{message.finishedThinking ? 'Thoughts' : 'Thinking...'}</summary>{' '}
          {message.think && (
            <blockquote className="">
              <Markdown highlight={[...highlightArray]}>{message.think}</Markdown>
            </blockquote>
          )}
        </details>
      )}
      <article className={`${message.role === 'user' ? '' : ''}`}>
        <Markdown highlight={[...highlightArray]}>{message.content}</Markdown>
      </article>
      {locations.length > 0 && (
        <details className="locations">
          <summary>{locations.length} locations</summary>
          <pre>{JSON.stringify(locations, null, 2)}</pre>
        </details>
      )}
      {message.role !== 'user' && !loading && (
        <>
          <div className="wrapper">
            {locations.length === 0 && !isExctractingLocation && (
              <button onClick={extractLocations}>🌐 extractLocations</button>
            )}
            {!isExctractingLocation && (
              <button onClick={showLocationsOnMap}>🌐 showLocationsOnMap</button>
            )}
            {locations.length > 0 && (
              <button onClick={removeLocationMarkers}>🌐 removeLocationMarkers</button>
            )}
            {locations.length > 0 && <button onClick={resetLocations}>🌐 resetLocations</button>}
          </div>
          {isExctractingLocation && (
            <details className="locations loading">
              <summary>🌐 extracting locations..</summary>
              <pre>This can take a few minutes.</pre>
            </details>
          )}
        </>
      )}
    </div>
  );
};

export default ChatMessage;
