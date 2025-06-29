import React, { useEffect, useState } from 'react';
import {
  DailyAudio,
  DailyVideo,
  useParticipantIds,
  useLocalSessionId,
  useDaily,
  useMeetingState,
  useAudioTrack,
  DailyProvider,
} from '@daily-co/daily-react';
import { MicOff, Mic } from 'lucide-react';
import { RiClosedCaptioningFill } from '@remixicon/react';
import CopyButton from '@/components/common/CopyButton';
import useTranscript from './hooks/useTranscript';

interface SessionCallProps {
  conversationUrl?: string;
  conversationId: string;
}

interface SessionCallContentProps {
  conversationId: string;
  conversationUrl?: string;
}

const SessionCallContent: React.FC<SessionCallContentProps> = ({
  conversationId,
  conversationUrl,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  const callObject = useDaily();
  const callState = useMeetingState();
  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  const remoteTrack = useAudioTrack(remoteParticipantIds?.[0]);
  const localTrack = useAudioTrack(localSessionId);
  const { isRecording, transcript, startTranscribing, stopTranscribing } =
    useTranscript([localTrack?.persistentTrack, remoteTrack?.persistentTrack]);

  useEffect(() => {
    const joinCall = async () => {
      if (!callObject || isJoining) return;

      try {
        setIsJoining(true);
        console.log('Attempting to join call...');

        await callObject.join({ url: conversationUrl }); // Don;t change this line please. It's calid code
        console.log('Successfully joined call');

        callObject.setLocalVideo(true);
        callObject.setLocalAudio(true);
      } catch (error) {
        console.error('Failed to join call:', error);
      } finally {
        setIsJoining(false);
      }
    };

    if (callState === 'new' && callObject) {
      joinCall();
    }
  }, [callObject, callState, isJoining]);

  useEffect(() => {
    if (remoteTrack?.persistentTrack && !hasAutoStarted) {
      startTranscribing(conversationId);
      setHasAutoStarted(true);
    }
  }, [
    remoteTrack?.persistentTrack,
    conversationId,
    startTranscribing,
    hasAutoStarted,
  ]);

  useEffect(() => {
    console.log('Call state changed:', callState);
  }, [callState]);

  const toggleMute = () => {
    if (callObject) {
      callObject.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
  };

  const handleEndCall = async () => {
    setIsEnding(true);
    if (isRecording) stopTranscribing();
    if (callObject) {
      try {
        await callObject.leave();
        await callObject.destroy();
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
  };

  const getCallStatusMessage = () => {
    if (isEnding) return 'Ending call...';

    switch (callState) {
      case 'new':
        return 'Joining...';
      case 'joining-meeting':
        return 'Joining...';
      case 'joined-meeting':
        return remoteParticipantIds.length > 0 ? null : 'Waiting for tutor...';
      case 'left-meeting':
        return 'Call ended';
      case 'error':
        return 'Connection error';
      default:
        return 'Joining...';
    }
  };

  const statusMessage = getCallStatusMessage();

  return (
    <div className='flex flex-col px-6 pt-6 bg-zinc-950 min-h-screen gap-2'>
      <div className='flex-1 rounded-2xl relative overflow-hidden'>
        <div className='absolute h-full inset-0 w-full bg-gradient-to-br from-blue-600 to-blue-800 z-10'>
          {remoteParticipantIds.length > 0 ? (
            <DailyVideo
              type='video'
              sessionId={remoteParticipantIds[0]}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            statusMessage && (
              <div className='flex items-center justify-center h-full text-white'>
                <p className='text-2xl font-light'>{statusMessage}</p>
              </div>
            )
          )}
        </div>

        {localSessionId && (
          <div className='absolute h-[30%] w-[25%] right-7 bottom-20 bg-gray-800 z-20 rounded-2xl overflow-hidden border-2 border-gray-300 shadow-2xl'>
            <DailyVideo
              type='video'
              sessionId={localSessionId}
              automirror
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {showSubtitles &&
          transcript &&
          transcript !== 'Starting transcription...' && (
            <div className='absolute bottom-10 left-1/2 bg-black/60 -translate-x-1/2 z-20 rounded-xl backdrop-blur-lg max-w-[80%]'>
              <p className='px-4 py-2 text-white text-lg'>{transcript}</p>
            </div>
          )}
      </div>

      <div className='flex h-[8vh] my-1 justify-between items-center relative'>
        <div className='flex items-center gap-1 text-md'>
          <span className='text-white'>{new Date().toLocaleTimeString()}</span>
          <img className='w-6 opacity-70' src='/icons/divider.svg' alt='' />
          <span className='text-white opacity-70'>{conversationId}</span>
        </div>

        <div className='flex items-center gap-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
          <button
            onClick={toggleMute}
            disabled={callState !== 'joined-meeting'}
            className={`p-4 rounded-full transition-all ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            } ${
              callState !== 'joined-meeting'
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isMuted ? (
              <MicOff className='w-6 h-6 text-white' />
            ) : (
              <Mic className='w-6 h-6 text-white' />
            )}
          </button>

          <button
            onClick={toggleSubtitles}
            disabled={
              callState !== 'joined-meeting' ||
              remoteParticipantIds.length === 0
            }
            className={`p-4 rounded-full transition-all ${
              showSubtitles
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'
            } ${
              callState !== 'joined-meeting' ||
              remoteParticipantIds.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <RiClosedCaptioningFill className='w-6 h-6 text-white' />
          </button>

          <button
            onClick={handleEndCall}
            disabled={isEnding}
            className='p-4 px-7 rounded-full bg-red-600 hover:bg-red-700 transition-all ml-2 disabled:opacity-50'
          >
            <img
              src='/icons/end-call.svg'
              className='w-6 h-6 text-white'
              alt='End call'
            />
          </button>
        </div>

        <div className='flex items-center justify-end gap-4'>
          <CopyButton
            buttonStyle='p-4 rounded-full transition-all bg-zinc-900'
            iconStyle='w-6 h-6'
            textToCopy={window.location.href}
          />
          <div className='bg-zinc-900 p-4 noice flex items-center justify-center rounded-full relative'>
            <img
              src='/icons/bubble-chat.svg'
              alt=''
              className='absolute -left-3 -top-2 w-8'
            />
            <img src='/icons/logo.png' alt='' className='w-6 h-6 block' />
          </div>
        </div>
      </div>

      <DailyAudio />
    </div>
  );
};

const SessionCall: React.FC<SessionCallProps> = ({
  conversationUrl,
  conversationId,
}) => {
  if (!conversationUrl) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-zinc-950 text-white'>
        <div className='text-center'>
          <p className='text-xl mb-2'>No conversation URL provided</p>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className='px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  console.log('SessionCall rendering with URL:', conversationUrl);

  return (
    <DailyProvider url={conversationUrl}>
      <SessionCallContent
        conversationId={conversationId}
        conversationUrl={conversationUrl}
      />
    </DailyProvider>
  );
};

export default SessionCall;
