import React, { useContext, useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import LLMao from '../../components/shared/LLMao';
import LegendLayout from '../../components/shared/LegendLayout';

import useChat from '../../hooks/useChat';
import ChatMessage from '../../components/shared/ChatMessage';
import { AtlasContext } from '../__root';
import { useStateStorage } from '../../hooks/useUtils';
import { ChatModelConfigProps, ModelConfig } from '../../types/atlas.types';
import ChatModelConfig from '../../components/shared/ChatModelConfig';

export const Route = createFileRoute('/information/chat')({
  component: ChatRouteComponent,
});

function ChatRouteComponent() {
  const [activeReasoningModel, setActiveReasoningModel] = useState('open-ai');
  const [reasoningModelConfig, setReasoningModelConfig] =
    useStateStorage<ModelConfig>(
      // Default Config
      'reasoningModelConfig',
      {
        baseURL: 'https://api.deepseek.com',
        apiKey: '',
        model: 'deepseek-chat',
        max_tokens: 5000,
        systemPrompt: `
          [Core Framework]
      
        You are a triple-aspect dialectical engine combining:
        1. Socratic Maieutics - Epistemological midwifery
        2. Hegelian Synthesis - Aufhebung processor
        3. Marxist Materialism - Historical contingency analyzer
        
        
        [Operational Protocol]
        
        - Maintain 3 parallel context layers:
        A) Immediate dialogue
        B) Historical dialectical progression
        C) Material conditions matrix
        - Use phase-specific response patterns
        - Track conceptual contradictions explicitly
      
        
        [Processing Rules]
        
        1. Phase Handling:
        - socratic: Challenge premises via elenchus
        - hegelian: Identify aufhebung opportunities
        - marxist: Root analysis in material conditions
        
        2. Contradiction Management:
        - When detecting contradictions:
        a) Categorize (Logical/Material/Dialectical)
        b) Preserve in tension matrix
        c) Map to historical precedents
        
        3. Synthesis Protocol:
        - Require 3-stage validation: 
        1. Material feasibility check 
        2. Historical progress alignment 
        3. Epistemological consistency test
        
        
        [Implementation Notes]
        
        1. Maximum dialectical depth: 7 layers
        2. Minimum material context required for Marxist phase
        3. Auto-escalate abstraction after 3 contradictions
        4. Default phase rotation: Socratic → Hegelian → Marxist
       `,
      },
      true,
    );
  const [activeToolModel, setActiveToolModel] = useState('open-ai');
  const [toolModelConfig, setToolModelConfig] = useStateStorage<ModelConfig>(
    // Default Config
    'toolModelConfig',
    {
      baseURL: 'https://localhost:11434',
      apiKey: '',
      model: 'gemma3:12b',
      max_tokens: 1000,
    },
    true,
  );

  const [
    userPrompt,
    setUserPrompt,
    messagesWithThinkingSplit,
    handleSendPrompt,
    loading,
    { models },
  ] = useChat({
    activeModel: activeReasoningModel,
    modelConfig: reasoningModelConfig,
  });

  const { activeAdministrativeRegion, activeGeographicIdentifier, map } =
    useContext(AtlasContext)!;

  const defaultUserPrompts = [
    'What is dialectical and historical materialism?',
    'Give me a dialectical materialist analysis of NATO.',
    'How does historical materialism explain the current climate crisis?',
    'Analyze the rise of right-wing populism through a dialectical materialist lens.',
  ];

  const defaultUserPromptsActiveLocation = [
    `Historical materialist view of ${activeAdministrativeRegion[activeGeographicIdentifier]}`,
    `Dialectical analysis of ${activeAdministrativeRegion[activeGeographicIdentifier]}'s class composition and productive forces.`,
    `Significant Economic Locations in ${activeAdministrativeRegion[activeGeographicIdentifier]}: A Materialist Perspective.`,
    `How has globalization affected class dynamics in ${activeAdministrativeRegion.name}, ${activeAdministrativeRegion.country}?`,
    `Analysis of ${activeAdministrativeRegion[activeGeographicIdentifier]}'s colonial history and its material consequences today.`,
  ];
  const ReasoningModelConfigProps: ChatModelConfigProps = {
    modelConfig: reasoningModelConfig,
    setModelConfig: setReasoningModelConfig,
    models,
    activeModel: activeReasoningModel,
    setActiveModel: setActiveReasoningModel,
  };

  const ToolModelConfigProps: ChatModelConfigProps = {
    modelConfig: toolModelConfig,
    setModelConfig: setToolModelConfig,
    models,
    activeModel: activeToolModel,
    setActiveModel: setActiveToolModel,
  };

  return (
    <LegendLayout className="chat__layout">
      <details>
        <summary>LLM Model Config</summary>

        {/* Troubleshoot  */}

        {models?.length === 0 && (
          <div className="container wraning">
            <small>Ollama not found</small>
            <h5>Troubleshoot</h5>
            <ul>
              <li>
                1. Install ollama via{' '}
                <a
                  href="https://ollama.com/download"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ollama.com
                </a>
              </li>
              <li>
                2. Pull a model e.g.
                <code>{`ollama pull deepseek-r1:7b`}</code>
              </li>
              <li>
                3. If redAtlas is not running on the same machine as ollama, add
                origin
                <code>
                  {`OLLAMA_ORIGINS=${window.location.origin} ollama serve`}
                </code>
              </li>
            </ul>
          </div>
        )}
        <ChatModelConfig
          chatModelConfigProps={ReasoningModelConfigProps}
          purpose={'Reasoning LLM'}
        />
        <ChatModelConfig
          chatModelConfigProps={ToolModelConfigProps}
          purpose={'Tool LLM'}
        />
      </details>

      {/* Consent */}
      <LLMao />

      {/* Default Prompts */}

      {messagesWithThinkingSplit.length === 1 && (
        <>
          {activeAdministrativeRegion.country === 'country' ? (
            <div className="container wrapper ">
              {defaultUserPrompts.map((prompt, index) => (
                <form onSubmit={handleSendPrompt} key={index}>
                  <button
                    type="submit"
                    onClick={() => setUserPrompt(prompt)}
                    className="action"
                  >
                    {prompt}
                  </button>
                </form>
              ))}
            </div>
          ) : (
            <div className="container wrapper ">
              {defaultUserPromptsActiveLocation.map((prompt, index) => (
                <form onSubmit={handleSendPrompt} key={index}>
                  <button
                    type="submit"
                    onClick={() => setUserPrompt(prompt)}
                    className="action"
                  >
                    {prompt}
                  </button>
                </form>
              ))}
            </div>
          )}
        </>
      )}

      {/* Chat */}

      {messagesWithThinkingSplit
        ?.filter(({ role }) => role === 'user' || role === 'assistant')
        ?.map((m, index) => (
          <ChatMessage
            key={index}
            message={m}
            activeToolModel={activeToolModel}
            activeReasoningModel={activeReasoningModel}
            map={map}
            toolModelConfig={toolModelConfig}
            highlightArray={[
              activeAdministrativeRegion.name,
              activeAdministrativeRegion.country,
              activeAdministrativeRegion.region,
              activeAdministrativeRegion['sub-region'],
              activeAdministrativeRegion['intermediate-region'],
            ]}
            loading={loading}
          />
        ))}

      {/* Map */}

      {/* User Prompt */}
      <div className="container  ask__container">
        <form onSubmit={handleSendPrompt} className="wrapper">
          <textarea
            value={userPrompt}
            disabled={loading}
            placeholder="Ask LLMao"
            onChange={(e) => setUserPrompt(e.target.value)}
          />
          <button
            className="ask__button"
            type="submit"
            disabled={loading || !userPrompt.trim()}
          >
            {loading ? <div className="loading">💬</div> : '📨'}
          </button>
        </form>
      </div>
    </LegendLayout>
  );
}
