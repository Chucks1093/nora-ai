import React, { useEffect, useState } from "react";
import {
	DailyAudio,
	DailyVideo,
	useParticipantIds,
	useLocalSessionId,
	useDaily,
	useMeetingState,
	useAudioTrack,
	DailyProvider,
} from "@daily-co/daily-react";
import { MicOff, Mic, PhoneOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import TranslateIcon from "@/assets/TranslateIcon";
import CopyButton from "@/components/common/CopyButton";
import useTranscript from "./hooks/useTranscript";

interface SessionCallContentProps {
	conversationUrl: string;
	sessionData?: any;
	onLeaveCall?: () => void;
}

const SessionCallInner: React.FC<{
	sessionData?: any;
	onLeaveCall?: () => void;
}> = ({ sessionData, onLeaveCall }) => {
	const [isMuted, setIsMuted] = useState(false);
	const [isJoining, setIsJoining] = useState(false);
	const [isEnding, setIsEnding] = useState(false);
	const navigate = useNavigate();

	const callObject = useDaily();
	const callState = useMeetingState();
	const localSessionId = useLocalSessionId();
	const remoteParticipantIds = useParticipantIds({ filter: "remote" });
	const remoteTrack = useAudioTrack(remoteParticipantIds?.[0]);
	const localTrack = useAudioTrack(localSessionId);

	const { isRecording, transcript, startTranscribing, stopTranscribing } =
		useTranscript([
			localTrack?.persistentTrack,
			remoteTrack?.persistentTrack,
		]);

	// Auto-join the call when component mounts
	useEffect(() => {
		const joinCall = async () => {
			if (!callObject || isJoining) return;

			try {
				setIsJoining(true);
				console.log("Attempting to join call...");

				// Join the call
				await callObject.join();
				console.log("Successfully joined call");

				// Enable camera and microphone
				await callObject.setLocalVideo(true);
				await callObject.setLocalAudio(true);
			} catch (error) {
				console.error("Failed to join call:", error);
			} finally {
				setIsJoining(false);
			}
		};

		if (callState === "new" && callObject) {
			joinCall();
		}
	}, [callObject, callState, isJoining]);

	// Log call state changes for debugging
	useEffect(() => {
		console.log("Call state changed:", callState);
	}, [callState]);

	const toggleMute = () => {
		if (callObject) {
			callObject.setLocalAudio(!isMuted);
			setIsMuted(!isMuted);
		}
	};

	const handleTranscriptionToggle = () => {
		if (isRecording) {
			stopTranscribing();
		} else {
			startTranscribing();
		}
	};

	const handleEndCall = async () => {
		setIsEnding(true);
		if (isRecording) stopTranscribing();
		if (callObject) {
			try {
				await callObject.leave();
				await callObject.destroy();
				// Use the callback or navigate to dashboard
				if (onLeaveCall) {
					onLeaveCall();
				} else {
					navigate("/dashboard");
				}
			} catch (error) {
				console.error("Error ending call:", error);
			}
		}
	};

	const getCallStatusMessage = () => {
		if (isEnding) return "Ending call...";

		switch (callState) {
			case "new":
				return "Preparing to join...";
			case "joining-meeting":
				return "Connecting...";
			case "joined-meeting":
				return remoteParticipantIds.length > 0
					? null
					: "Waiting for tutor to join...";
			case "left-meeting":
				return "Call ended";
			case "error":
				return "Connection error - please try again";
			default:
				return "Connecting...";
		}
	};

	const statusMessage = getCallStatusMessage();

	return (
		<div className='flex flex-col h-screen bg-zinc-950'>
			{/* Header - Session Info */}
			<div className='flex items-center justify-between px-6 py-4 bg-zinc-900/50 backdrop-blur-sm'>
				<div className='flex items-center gap-4'>
					<Button
						onClick={() =>
							onLeaveCall ? onLeaveCall() : navigate("/dashboard")
						}
						variant='ghost'
						size='sm'
						className='text-white hover:bg-white/10'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back
					</Button>

					{sessionData && (
						<div className='text-white'>
							<h2 className='font-semibold'>{sessionData.title}</h2>
							<p className='text-sm text-gray-300'>
								with {sessionData.tutor}
							</p>
						</div>
					)}
				</div>

				<div className='flex items-center gap-2 text-white text-sm'>
					<div
						className={`w-2 h-2 rounded-full ${
							callState === "joined-meeting"
								? "bg-green-500"
								: "bg-yellow-500"
						}`}
					/>
					<span>
						{callState === "joined-meeting"
							? "Connected"
							: "Connecting..."}
					</span>
				</div>
			</div>

			{/* Main Video Area */}
			<div className='flex-1 relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800'>
				{/* Remote participant video */}
				{remoteParticipantIds.length > 0 ? (
					<DailyVideo
						type='video'
						sessionId={remoteParticipantIds[0]}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
						}}
					/>
				) : (
					statusMessage && (
						<div className='flex flex-col items-center justify-center h-full text-white'>
							<div className='text-center max-w-md'>
								<div className='w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4'>
									<div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin' />
								</div>
								<p className='text-2xl font-light mb-2'>
									{statusMessage}
								</p>
								<p className='text-sm text-white/70'>
									{callState === "joining-meeting"
										? "Please wait while we connect you..."
										: "Your tutor will join shortly"}
								</p>
							</div>
						</div>
					)
				)}

				{/* Local participant video (Picture-in-Picture) */}
				{localSessionId && (
					<div className='absolute bottom-20 right-6 w-64 h-48 bg-gray-900 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl'>
						<DailyVideo
							type='video'
							sessionId={localSessionId}
							automirror
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
						/>
					</div>
				)}

				{/* Transcription Display */}
				{isRecording &&
					transcript &&
					transcript !== "Starting transcription..." && (
						<div className='absolute bottom-24 left-1/2 transform -translate-x-1/2 max-w-4xl w-full px-6'>
							<div className='bg-black/70 backdrop-blur-lg rounded-xl p-4 border border-white/10'>
								<div className='flex items-start gap-3'>
									<div className='w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse' />
									<div>
										<p className='text-white text-sm font-medium mb-1'>
											Live Transcript
										</p>
										<p className='text-white/90 leading-relaxed'>
											{transcript}
										</p>
									</div>
								</div>
							</div>
						</div>
					)}
			</div>

			{/* Bottom Controls */}
			<div className='bg-zinc-900 px-6 py-4'>
				<div className='flex items-center justify-between'>
					{/* Left - Session Info */}
					<div className='flex items-center gap-4 text-white text-sm'>
						<span>{new Date().toLocaleTimeString()}</span>
						<div className='w-1 h-1 bg-white/50 rounded-full' />
						<span className='text-white/70'>Live Session</span>
					</div>

					{/* Center - Main Controls */}
					<div className='flex items-center gap-4'>
						{/* Mute Toggle */}
						<Button
							onClick={toggleMute}
							disabled={callState !== "joined-meeting"}
							size='lg'
							className={`w-14 h-14 rounded-full ${
								isMuted
									? "bg-red-600 hover:bg-red-700"
									: "bg-zinc-700 hover:bg-zinc-600"
							} disabled:opacity-50`}>
							{isMuted ? (
								<MicOff className='w-6 h-6 text-white' />
							) : (
								<Mic className='w-6 h-6 text-white' />
							)}
						</Button>

						{/* Transcription Toggle */}
						<Button
							onClick={handleTranscriptionToggle}
							disabled={
								callState !== "joined-meeting" ||
								remoteParticipantIds.length === 0
							}
							size='lg'
							className={`w-14 h-14 rounded-full ${
								isRecording
									? "bg-blue-600 hover:bg-blue-700"
									: "bg-zinc-700 hover:bg-zinc-600"
							} disabled:opacity-50`}>
							<TranslateIcon
								color='white'
								size={24}
								className='w-6 h-6'
							/>
						</Button>

						{/* End Call */}
						<Button
							onClick={handleEndCall}
							disabled={isEnding}
							size='lg'
							className='w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50'>
							<PhoneOff className='w-6 h-6 text-white' />
						</Button>
					</div>

					{/* Right - Additional Controls */}
					<div className='flex items-center gap-3'>
						<CopyButton
							buttonStyle='w-10 h-10 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center'
							iconStyle='w-5 h-5'
							textToCopy={window.location.href}
						/>

						<div className='w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center'>
							<img
								src='/icons/logo.png'
								alt='Nora AI'
								className='w-5 h-5'
								onError={(e) => {
									e.currentTarget.style.display = "none";
									e.currentTarget.parentElement!.innerHTML =
										'<span class="text-white font-bold text-xs">N</span>';
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			<DailyAudio />
		</div>
	);
};

const SessionCallContent: React.FC<SessionCallContentProps> = ({
	conversationUrl,
	sessionData,
	onLeaveCall,
}) => {
	if (!conversationUrl) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-zinc-950 text-white'>
				<div className='text-center'>
					<p className='text-xl mb-4'>Invalid session URL</p>
					<Button
						onClick={() =>
							onLeaveCall
								? onLeaveCall()
								: (window.location.href = "/dashboard")
						}
						variant='outline'>
						Return to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	return (
		<DailyProvider url={conversationUrl}>
			<SessionCallInner
				sessionData={sessionData}
				onLeaveCall={onLeaveCall}
			/>
		</DailyProvider>
	);
};

export default SessionCallContent;
