import React, { useState } from 'react';
import { ChatModelConfigProps } from '../../types/atlas.types';

function ChatModelConfig({
  chatModelConfigProps,
  purpose,
}: {
  chatModelConfigProps: ChatModelConfigProps;
  purpose;
}) {
  const { modelConfig, setModelConfig, models, activeModel, setActiveModel } =
    chatModelConfigProps;
  const [isEditModelConfig, setIsEditModelConfig] = useState(true);

  function handleSetOpenAIModel(e: React.FormEvent) {
    e.preventDefault();

    const data = new FormData(e.target as HTMLFormElement);

    const isEmpty = data.entries().next().done;

    if (!isEmpty) {
      setModelConfig((prev) => ({
        ...prev,
        baseURL: data.get('baseURL') as string,
        apiKey: data.get('apiKey') as string,
        model: data.get('model') as string,
        max_tokens: Number(data.get('max_tokens')),
        systemPrompt: data.get('systemPrompt') as string,
      }));
    }
    setIsEditModelConfig(!isEditModelConfig);
  }

  {
    /*  System Prompt */
  }

  <details>
    <summary>System Prompt</summary>
  </details>;

  return (
    <fieldset>
      <legend>{purpose}</legend>
      {/* Ollama Model Selection */}

      <label className="wrapper">
        <select id="models" onChange={(e) => setActiveModel(e.target.value)}>
          <option value={'ollama'} disabled>
            ### ollama ###
          </option>
          {models?.map((model, index) => {
            return (
              <option value={model.name} key={index}>
                {model.name}
              </option>
            );
          })}
          <option value={'open-ai'} disabled>
            ### open-ai ###
          </option>
          <option value={'open-ai'}>OpenAI - Config</option>
        </select>
      </label>

      {/* OpenAI Model Selection */}

      <form
        name="modelConfig"
        onSubmit={handleSetOpenAIModel}
        className="container wrapper chat__config"
      >
        <input
          disabled={!isEditModelConfig}
          name="baseURL"
          type="url"
          defaultValue={modelConfig.baseURL}
          placeholder="baseURL e.g. https://api.deepseek.com"
        />
        <input
          disabled={!isEditModelConfig}
          name="apiKey"
          type="password"
          defaultValue={modelConfig.apiKey}
          placeholder="apiKey e.g. sk-13abac12..."
        />
        <input
          disabled={!isEditModelConfig}
          name="model"
          type="text"
          defaultValue={modelConfig.model}
          placeholder="model e.g. deepseek-chat"
        />
        <label htmlFor="max_tokens">Max Tokens: {modelConfig.max_tokens}</label>
        <input
          disabled={!isEditModelConfig}
          name="max_tokens"
          type="range"
          min={0}
          max={8192}
          step={10}
          defaultValue={modelConfig.max_tokens}
          onChange={(e) => {
            setModelConfig((prev) => ({
              ...prev,
              max_tokens: Number(e.target.value),
            }));
          }}
          placeholder="model e.g. deepseek-chat"
        />
        <textarea
          name={'systemPrompt'}
          className="chat__systemprompt"
          value={modelConfig.systemPrompt}
          placeholder={modelConfig.systemPrompt}
          onChange={(e) =>
            setModelConfig((prev) => ({
              ...prev,
              systemPrompt: e.target.value as string,
            }))
          }
        />
        <button type="submit">{isEditModelConfig ? '💾' : '✍'}</button>
      </form>
    </fieldset>
  );
}

export default ChatModelConfig;
