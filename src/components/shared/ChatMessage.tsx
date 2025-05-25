import React, { useEffect, useState } from 'react';

import Markdown from '../../components/shared/Markdown';
import { MessageWithThinking } from '../../types/atlas.types';

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
  const hashHex = hashArray
    .map((b) => ('00' + b.toString(16)).slice(-2))
    .join('');
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
  const [locations, setLocations] = useState([]);
  const [initialLoad, setInitialLoad] = useStateStorage(
    sha256(message.think),
    true,
  );

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
              description:
                'Emoji symbolizing primary contextual theme (e.g., 🏭 for industrial)',
              required: true,
            },
          },
          required: ['name', 'nominatim', 'description', 'emoji'],
        },
      },
    };
    const locationToolPrompt = JSON.stringify(locationTool);

    const systemPrompt = `
    You will act as a specialized geographic location analyzer to systematically identify and 
    classify mentions of geographic locations within any provided text. 
    For each location detected, extract its contextual description (e.g., "economic hub," "rural area," "coastal region") and 
    return the results in a structured JSON format. 
    If no locations are mentioned, return an empty array. Ensure accuracy by avoiding assumptions—only include locations explicitly stated or strongly implied by the text. 
    Respond only with valid JSON matching the required schema.
    
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

      const { locations } = await JSON.parse(
        response.choices[0].message.content as string,
      );
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

  const showLocationsOnMap = () => {
    if (locations.length === 0) return;

    const LLMboundingbox = L.latLngBounds(
      null as unknown as LatLngExpression,
      null as unknown as LatLngExpression,
    );

    try {
      locations?.map(async (location) => {
        const { name, description, emoji, nominatim } = location;
        const nominatimResponse = await getNominatimLocation(nominatim);
        if (nominatimResponse) {
          LLMboundingbox.extend([nominatimResponse.lat, nominatimResponse.lon]);
          map?.flyToBounds(LLMboundingbox, { padding: [100, 100] });
          createMapPopup(nominatimResponse, name, description, emoji);
        }

        return { name, description, emoji, nominatim: nominatimResponse };
      });
    } catch (error) {
      console.log(error);
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
    <div
      className={`${message.role === 'user' && 'container neutral chat__message'}`}
    >
      <span className="">
        {message.role === 'user'
          ? '🚩'
          : !message.finishedThinking
            ? '⏳'
            : '🤖'}

        <span>
          {message.role === 'user'
            ? 'You'
            : `LLMao (${activeReasoningModel || toolModelConfig.model})`}
        </span>
      </span>
      {message.role === 'assistant' && (
        <details open={!message.finishedThinking}>
          <summary>
            {message.finishedThinking ? 'Thoughts' : 'Thinking...'}
          </summary>{' '}
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
        <details>
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
          <button className="loading" onClick={showLocationsOnMap}>
            🌐 showLocationsOnMap
          </button>
        </>
      )}
    </div>
  );
};

export default ChatMessage;
