import { useState } from 'react';
import { ConversationData } from '../types/conversation';

interface UseCallReturn {
  data: ConversationData | null;
  loading: boolean;
  error: string | null;
  makeCall: (apiKey: string) => Promise<void>;
  resetCall: (apiKey?: string) => Promise<void>;
}

const API_BASE_URL = 'https://tavusapi.com/v2/conversations';

const useCall = (): UseCallReturn => {
  const [data, setData] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const makeCall = async (apiKey: string) => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    const options = {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replica_id: 'rc2146c13e81',
        persona_id: 'p28ff60873c3',
        conversational_context:
          "You're about to talk to a friend about Atoms in chemistry",
        custom_greeting: "What's going on?",
        properties: {
          max_call_duration: 120,
          participant_left_timeout: 5,
          participant_absent_timeout: 5,
          language: 'english',
        },
      }),
    };

    try {
      const response = await fetch(API_BASE_URL, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetCall = async (apiKey?: string) => {
    if (data?.conversation_id && apiKey) {
      try {
        const options = {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
          },
        };

        await fetch(`${API_BASE_URL}/${data.conversation_id}/end`, options);
        console.log('Conversation ended on server');
      } catch (err) {
        console.error('Failed to end conversation on server:', err);
      }
    }

    setData(null);
    setError(null);
  };

  return { data, loading, error, makeCall, resetCall };
};

export default useCall;
