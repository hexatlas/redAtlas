import React, { useEffect, useMemo, useState } from 'react';
import ollama, { ListResponse, Message } from 'ollama/browser';
import OpenAI from 'openai';

import { MessageWithThinking, ModelConfig } from '../types/atlas.types';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

function useChat({
  activeModel,
  modelConfig = {
    baseURL: import.meta.env.VITE_MODEL_BASEURL,
    apiKey: import.meta.env.VITE_MODEL_API_KEY,
    model: import.meta.env.VITE_MODEL_NAME,
    max_tokens: 3500,
    systemPrompt: ``,
  },
}: {
  activeModel: string;
  modelConfig: ModelConfig;
}): [
  string,
  React.Dispatch<React.SetStateAction<string>>,
  MessageWithThinking[],
  (e: React.FormEvent<HTMLFormElement>) => Promise<void>,
  boolean,
  ListResponse,
] {
  const { baseURL, apiKey, model, max_tokens, systemPrompt } = modelConfig;

  const [models, setModels] = useState<ListResponse>({ models: [] });

  const [userPrompt, setUserPrompt] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: systemPrompt },
  ]);
  const [loading, setLoading] = useState(true);

  const messagesWithThinkingSplit = useMessagesWithThinking(messages);

  const handleSendPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserPrompt('');
    setLoading(true);

    const messagesWithInput: Message[] = [
      ...messages,
      { role: 'user', content: userPrompt },
    ];
    setMessages(() => messagesWithInput);

    // OPEN AI
    if (activeModel === 'open-ai') {
      const openai = new OpenAI({
        baseURL,
        apiKey,
        dangerouslyAllowBrowser: true,
        defaultHeaders: {
          'x-stainless-retry-count': null,
          'x-stainless-timeout': null,
        },
        timeout: 60 * 1000,
      });
      const completion = await openai.chat.completions.create({
        messages: messagesWithInput as ChatCompletionMessageParam[],
        model,
        stream: true,
        max_tokens: Number(max_tokens),
      });

      if (completion) {
        let assistantResponse = '';
        for await (const part of completion) {
          assistantResponse += part.choices[0].delta.content;

          setMessages([
            ...messagesWithInput,
            {
              role: 'assistant',
              content: assistantResponse,
            },
          ]);
        }
      }
    }
    // OLLAMA
    if (activeModel !== 'open-ai') {
      const ollamaStream = await ollama.chat({
        model: activeModel,
        messages: messagesWithInput as Message[],
        stream: true,
      });

      if (ollamaStream) {
        let assistantResponse = '';
        for await (const part of ollamaStream) {
          assistantResponse += part.message.content;
          setMessages([
            ...messagesWithInput,
            {
              role: 'assistant',
              content: assistantResponse,
            },
          ]);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await ollama.list();
        setModels(response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchModels();
  }, []);

  return [
    userPrompt,
    setUserPrompt,
    messagesWithThinkingSplit,
    handleSendPrompt,
    loading,
    models,
  ];
}

function useMessagesWithThinking(messages: Message[]) {
  return useMemo(
    () =>
      messages.map((m: Message): MessageWithThinking => {
        if (m.role === 'assistant') {
          if (m.content.includes('</think>')) {
            return {
              ...m,
              finishedThinking: true,
              think: m.content
                .split('</think>')[0]
                .replace('</think>', '')
                .replace('<think>', ''),
              content: m.content.split('</think>')[1],
            };
          } else {
            return {
              ...m,
              finishedThinking: false,
              think: m.content.replace('<think>', ''),
              content: '',
            };
          }
        }
        return m;
      }),
    [messages],
  );
}

export default useChat;
