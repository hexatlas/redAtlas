import React, { useEffect, useState } from 'react';

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
    `chat-${sha256(message)}-locations`,
    [],
  );
  const [initialLoad, setInitialLoad] = useStateStorage(sha256(message.think), true);

  useEffect(() => {
    if (!loading && initialLoad) {
      extractLocations();
      setInitialLoad(false);
    }
  }, [loading]);

  const extractLocations = async () => {
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
    return setLocations(LLMlocations);
  };

  useEffect(() => {
    showLocationsOnMap();
  }, [locations]);

  const showLocationsOnMap = async () => {
    try {
      if (locations.length === 0) return;

      const LLMboundingbox = L.latLngBounds(
        null as unknown as LatLngExpression,
        null as unknown as LatLngExpression,
      );
      for (const location of locations) {
        const { name, description, emoji, nominatim } = location;
        const nominatimResponse = await getNominatimLocation(nominatim);

        if (!nominatimResponse) continue;
        location.nominatimResponse = nominatimResponse;

        LLMboundingbox.extend([nominatimResponse.lat, nominatimResponse.lon]);
        map?.flyToBounds(LLMboundingbox, { padding: [100, 100] });
        createMapPopup(nominatimResponse, name, description, emoji);

        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } catch (error) {
      console.error('Error showing locations:', error);
      setLocations([]);
    }
  };

  const createMapPopup = (nominatimResponse, name, description, emoji) => {
    const emojiIcon = L.divIcon({
      html: `<div class="cluster-info">${emoji}</div>`,
      className: 'emoji-icon',
    });

    const marker = L.marker([nominatimResponse.lat, nominatimResponse.lon], {
      icon: emojiIcon,
    });
    const popupContent = `
          <h1 class="emoji">${emoji}</h1>
          <h4>${name || 'Unnamed'}</h4>
          <p>${description}</p>
        `;
    const popup = L.popup().setContent(popupContent);
    marker.bindPopup(popup);

    // Add event listener for popup open
    marker.on('popupopen', () => {
      console.log({ name, description, emoji, nominatim: nominatimResponse });
    });
    map?.addLayer(marker);
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
      {message.role === 'assistant' && (
        <details open={!message.finishedThinking} className="thoughts">
          <summary>{message.finishedThinking ? 'Thoughts' : 'Thinking...'}</summary>{' '}
          {message.think && (
            <blockquote className="">
              <Markdown highlight={highlightArray}>{message.think}</Markdown>
            </blockquote>
          )}
        </details>
      )}
      <article className={`${message.role === 'user' ? '' : ''}`}>
        <Markdown highlight={highlightArray}>{message.content}</Markdown>
      </article>
      {locations.length > 0 && (
        <details className="locations">
          <summary>{locations.length} locations</summary>
          <pre>{JSON.stringify(locations, null, 2)}</pre>
        </details>
      )}
      {message.role !== 'user' && !loading && (
        <>
          {locations.length === 0 && (
            <button className="loading" onClick={extractLocations}>
              🌐 extractLocations
            </button>
          )}
          {locations.length > 0 && (
            <button className="loading" onClick={showLocationsOnMap}>
              🌐 showLocationsOnMap
            </button>
          )}
        </>
      )}{' '}
      {locations.length > 0 && (
        <button className="loading" onClick={() => setLocations([])}>
          🌐 reset
        </button>
      )}
    </div>
  );
};

export default ChatMessage;
