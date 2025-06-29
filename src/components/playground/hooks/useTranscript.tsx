import { useState, useRef } from 'react';

interface UseTranscriptReturn {
  transcript: string;
  isRecording: boolean;
  startTranscribing: () => Promise<void>;
  stopTranscribing: () => void;
}

export default function useTranscript(
  audioTracks: (MediaStreamTrack | undefined)[]
): UseTranscriptReturn {
  const [transcript, setTranscript] = useState<string>(
    'Transcripts will be displayed here'
  );
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const websockRef = useRef<WebSocket | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval>>();
  const bufferQueue = useRef<Uint8Array[]>([]);
  const bufferSize = useRef(0);

  const startTranscribing = async (): Promise<void> => {
    try {
      if (audioTracks.includes(undefined))
        throw new Error('Cannot start transcription without remote audio');
      setTranscript('Transcription Starting ...');

      // Will soon set up Backend to have a permanent ws endpoint
      const websocket = new WebSocket(
        `wss://${import.meta.env.VITE_API_BASE_URL}/transcript`
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

        // Combine buffers
        const combined = new Uint8Array(bufferSize.current);
        let offset = 0;
        for (const buf of bufferQueue.current) {
          combined.set(buf, offset);
          offset += buf.length;
        }

        websocket.send(combined.buffer);

        // Clear buffers
        bufferQueue.current = [];
        bufferSize.current = 0;
      }, 100);
      intervalIdRef.current = intervalId;

      websocket.onmessage = (event: MessageEvent) => {
        console.log('received something');
        const data = JSON.parse(event.data);
        setTranscript(data.transcript);
      };

      websocket.onclose = async () => {
        console.log('Clearing interval');
        clearInterval(intervalId);
        setIsRecording(false);
        setTranscript('Transcripts will be displayed here');
        await ctx.close();
      };

      websocket.onerror = async () => {
        setIsRecording(false);
        clearInterval(intervalId);
        setTranscript('Transcription Error. Try again.');
      };
      setIsRecording(true);
    } catch (error) {
      console.error('Error Starting Transcription:', error);
    }
  };

  const stopTranscribing = (): void => {
    if (websockRef.current) websockRef.current.close();
  };

  return { transcript, isRecording, startTranscribing, stopTranscribing };
}
