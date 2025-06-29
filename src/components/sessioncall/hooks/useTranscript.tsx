import { useState, useRef } from 'react';

interface UseTranscriptReturn {
  transcript: string;
  isRecording: boolean;
  startTranscribing: (conversationId: string) => Promise<void>;
  stopTranscribing: () => void;
}

interface MessageWS {
  audio: number[];
  conversationId: string;
}

export default function useTranscript(
  audioTracks: (MediaStreamTrack | undefined)[]
): UseTranscriptReturn {
  const [transcript, setTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const websockRef = useRef<WebSocket | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval>>();
  const bufferQueue = useRef<Uint8Array[]>([]);
  const bufferSize = useRef(0);

  const startTranscribing = async (conversationId: string): Promise<void> => {
    try {
      if (audioTracks.includes(undefined)) {
        console.warn('Cannot start transcription without audio tracks');
        return;
      }

      setTranscript('Starting transcription...');

      const websocket = new WebSocket(
        'wss://nora-backend-production.up.railway.app/transcript'
      );
      websockRef.current = websocket;

      const ctx = new AudioContext({ sampleRate: 16_000 });
      await ctx.audioWorklet.addModule('/scripts/audioworklet.js');

      const dest = ctx.createMediaStreamDestination();
      audioTracks
        .filter((track) => track !== undefined)
        .map((track) => {
          ctx.createMediaStreamSource(new MediaStream([track])).connect(dest);
        });

      const pcmNode = new AudioWorkletNode(ctx, 'pcm-processor');
      ctx.createMediaStreamSource(dest.stream).connect(pcmNode);
      pcmNode.connect(ctx.destination);

      pcmNode.port.onmessage = (e) => {
        if (e.data) {
          bufferQueue.current.push(new Uint8Array(e.data));
          bufferSize.current += e.data.byteLength;
        }
      };

      const intervalId = setInterval(() => {
        if (websocket.readyState !== WebSocket.OPEN || bufferSize.current === 0)
          return;

        const combined = new Uint8Array(bufferSize.current);
        let offset = 0;
        for (const buf of bufferQueue.current) {
          combined.set(buf, offset);
          offset += buf.length;
        }

        // Create message with audio data and conversation ID
        const message: MessageWS = {
          audio: Array.from(combined),
          conversationId: conversationId,
        };

        websocket.send(JSON.stringify(message));

        bufferQueue.current = [];
        bufferSize.current = 0;
      }, 100);
      intervalIdRef.current = intervalId;

      websocket.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        setTranscript(data.transcript);
      };

      websocket.onclose = async () => {
        clearInterval(intervalId);
        setIsRecording(false);
        setTranscript('');
        await ctx.close();
      };

      websocket.onerror = async () => {
        setIsRecording(false);
        clearInterval(intervalId);
        setTranscript('Transcription error. Try again.');
      };

      setIsRecording(true);
    } catch (error) {
      console.error('Error starting transcription:', error);
      setTranscript('Failed to start transcription');
    }
  };

  const stopTranscribing = (): void => {
    if (websockRef.current) {
      websockRef.current.close();
    }
  };

  return { transcript, isRecording, startTranscribing, stopTranscribing };
}
