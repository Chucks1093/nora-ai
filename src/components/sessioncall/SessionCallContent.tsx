import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { MicOff, Mic, RefreshCw } from "lucide-react";
import { RiClosedCaptioningFill } from "@remixicon/react";
import CopyButton from "@/components/common/CopyButton";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import useTranscript from "./hooks/useTranscript";
import { useNavigate } from "react-router";
import { sessionService } from "@/services/session.service";

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
	// State management with proper resets
	const [isMuted, setIsMuted] = useState(false);
	const [isJoining, setIsJoining] = useState(false);
	const [isEnding, setIsEnding] = useState(false);
	const [showSubtitles, setShowSubtitles] = useState(false);
	const [hasAutoStarted, setHasAutoStarted] = useState(false);
	const [joinAttempts, setJoinAttempts] = useState(0);
	const [connectionError, setConnectionError] = useState<string | null>(null);
	const [isReconnecting, setIsReconnecting] = useState(false);
	const [wasJoinedSuccessfully, setWasJoinedSuccessfully] = useState(false);

	// Refs to prevent race conditions
	const isJoiningRef = useRef(false);
	const hasJoinedRef = useRef(false);
	const cleanupRef = useRef(false);
	const mountedRef = useRef(true);
	const unexpectedDisconnectRef = useRef(false);

	const callObject = useDaily();
	const callState = useMeetingState();
	const localSessionId = useLocalSessionId();
	const remoteParticipantIds = useParticipantIds({ filter: "remote" });
	const allParticipantIds = useParticipantIds();
	const remoteTrack = useAudioTrack(remoteParticipantIds?.[0]);
	const localTrack = useAudioTrack(localSessionId);
	const { isRecording, transcript, startTranscribing, stopTranscribing } =
		useTranscript([
			localTrack?.persistentTrack,
			remoteTrack?.persistentTrack,
		]);
	const navigate = useNavigate();

	// Reset all state on mount
	useEffect(() => {
		console.log("SessionCallContent mounted");
		mountedRef.current = true;
		setIsMuted(false);
		setIsJoining(false);
		setIsEnding(false);
		setShowSubtitles(false);
		setHasAutoStarted(false);
		setJoinAttempts(0);
		setConnectionError(null);
		setIsReconnecting(false);
		setWasJoinedSuccessfully(false);
		isJoiningRef.current = false;
		hasJoinedRef.current = false;
		cleanupRef.current = false;
		unexpectedDisconnectRef.current = false;

		return () => {
			console.log("SessionCallContent unmounting");
			mountedRef.current = false;
			cleanupRef.current = true;
		};
	}, [conversationUrl]);

	// Handle unexpected disconnection
	const handleUnexpectedDisconnection = useCallback(async () => {
		if (unexpectedDisconnectRef.current || isEnding || cleanupRef.current) {
			return;
		}

		console.log("Handling unexpected disconnection...");
		unexpectedDisconnectRef.current = true;
		setIsEnding(true);
		cleanupRef.current = true;

		try {
			// Stop transcription if active
			if (isRecording) {
				stopTranscribing();
			}

			// Update session status to "ENDED" for unexpected disconnection
			await sessionService.updateSessionCall(
				"conversation_id",
				conversationId,
				{
					status: "ENDED", // Use "ENDED" instead of "COMPLETED"
				}
			);

			console.log(
				"Session status updated to ENDED due to unexpected disconnection"
			);

			// Clean up call object
			if (callObject) {
				try {
					await callObject.leave();
					setTimeout(async () => {
						try {
							await callObject.destroy();
						} catch (error) {
							console.warn("Error destroying call object:", error);
						}
					}, 500);
				} catch (error) {
					console.warn("Error leaving call:", error);
				}
			}

			// Navigate with indication of unexpected end
			setTimeout(() => {
				navigate("/dashboard/session/history", {
					state: {
						conversationId,
						unexpectedEnd: true,
					},
					replace: true,
				});
			}, 1000);
		} catch (error) {
			console.error("Error handling unexpected disconnection:", error);
			// Force navigation even on error
			navigate("/dashboard/session/history", {
				state: {
					conversationId,
					unexpectedEnd: true,
				},
				replace: true,
			});
		}
	}, [
		callObject,
		isRecording,
		stopTranscribing,
		navigate,
		conversationId,
		isEnding,
	]);

	// Optimized join call function with better error handling
	const joinCall = useCallback(async () => {
		if (
			!callObject ||
			!conversationUrl ||
			isJoiningRef.current ||
			hasJoinedRef.current ||
			cleanupRef.current
		) {
			return;
		}

		try {
			isJoiningRef.current = true;
			setIsJoining(true);
			setConnectionError(null);
			console.log("Attempting to join call...", conversationUrl);

			// Set a timeout for join attempt
			const joinPromise = callObject.join({ url: conversationUrl });
			const timeoutPromise = new Promise((_, reject) =>
				setTimeout(() => reject(new Error("Join timeout")), 15000)
			);

			await Promise.race([joinPromise, timeoutPromise]);

			if (!mountedRef.current) return;

			console.log("Successfully joined call");
			hasJoinedRef.current = true;
			setWasJoinedSuccessfully(true);

			// Set media preferences
			await callObject.setLocalVideo(true);
			await callObject.setLocalAudio(!isMuted);
		} catch (error) {
			console.error("Failed to join call:", error);
			if (mountedRef.current) {
				setConnectionError("Failed to connect. Retrying...");
				setJoinAttempts((prev) => prev + 1);

				// Retry logic with exponential backoff
				if (joinAttempts < 3) {
					setTimeout(() => {
						if (mountedRef.current && !cleanupRef.current) {
							isJoiningRef.current = false;
							joinCall();
						}
					}, Math.pow(2, joinAttempts) * 1000);
				} else {
					setConnectionError("Unable to connect. Please try again.");
				}
			}
		} finally {
			if (mountedRef.current) {
				isJoiningRef.current = false;
				setIsJoining(false);
			}
		}
	}, [callObject, conversationUrl, isMuted, joinAttempts]);

	// Manual reconnect function
	const handleReconnect = useCallback(async () => {
		if (isReconnecting || isJoining || isEnding) return;

		console.log("Manual reconnect initiated");
		setIsReconnecting(true);
		setConnectionError(null);
		setJoinAttempts(0);

		// Reset connection state
		isJoiningRef.current = false;
		hasJoinedRef.current = false;
		unexpectedDisconnectRef.current = false;

		try {
			// Leave current call if connected
			if (callObject && callState !== "new") {
				await callObject.leave();
			}

			// Wait a moment before rejoining
			setTimeout(() => {
				if (mountedRef.current && !cleanupRef.current) {
					setIsReconnecting(false);
					joinCall();
				}
			}, 1000);
		} catch (error) {
			console.error("Error during reconnect:", error);
			setIsReconnecting(false);
			setConnectionError("Reconnection failed. Please try again.");
		}
	}, [callObject, callState, joinCall, isReconnecting, isJoining, isEnding]);

	// Join call effect with proper guards
	useEffect(() => {
		if (
			callState === "new" &&
			callObject &&
			!hasJoinedRef.current &&
			!cleanupRef.current
		) {
			// Small delay to ensure proper initialization
			const timer = setTimeout(() => {
				if (mountedRef.current && !cleanupRef.current) {
					joinCall();
				}
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [callObject, callState, joinCall]);

	// Auto-start transcription with better logic
	useEffect(() => {
		if (
			remoteTrack?.persistentTrack &&
			!hasAutoStarted &&
			callState === "joined-meeting" &&
			!cleanupRef.current
		) {
			console.log("Starting transcription");
			startTranscribing(conversationId);
			setHasAutoStarted(true);
		}
	}, [
		remoteTrack?.persistentTrack,
		conversationId,
		startTranscribing,
		hasAutoStarted,
		callState,
	]);

	// Enhanced call state monitoring for unexpected disconnections
	useEffect(() => {
		console.log("Call state changed:", callState);
		console.log("All participants:", allParticipantIds.length);
		console.log("Was joined successfully:", wasJoinedSuccessfully);

		// Handle unexpected disconnection scenarios
		if (
			wasJoinedSuccessfully &&
			!isEnding &&
			!unexpectedDisconnectRef.current
		) {
			// Scenario 1: Call state indicates disconnection
			if (callState === "left-meeting") {
				console.log("Unexpected disconnection - left meeting");
				handleUnexpectedDisconnection();
				return;
			}

			// Scenario 2: Error state after successful join
			if (callState === "error") {
				console.log("Unexpected disconnection - error state");
				handleUnexpectedDisconnection();
				return;
			}

			// Scenario 3: Network issues - all participants gone but still "joined"
			if (callState === "joined-meeting" && allParticipantIds.length <= 1) {
				// Wait a few seconds to see if participants rejoin (network glitch)
				const checkDisconnectionTimer = setTimeout(() => {
					if (
						mountedRef.current &&
						callState === "joined-meeting" &&
						allParticipantIds.length <= 1 &&
						wasJoinedSuccessfully &&
						!isEnding &&
						!unexpectedDisconnectRef.current
					) {
						console.log(
							"Unexpected disconnection - all participants gone"
						);
						handleUnexpectedDisconnection();
					}
				}, 5000); // Wait 5 seconds before considering it an unexpected disconnection

				return () => clearTimeout(checkDisconnectionTimer);
			}
		}
	}, [
		callState,
		allParticipantIds.length,
		wasJoinedSuccessfully,
		isEnding,
		handleUnexpectedDisconnection,
	]);

	// Monitor participant changes for additional disconnection detection
	useEffect(() => {
		// If we were successfully connected with remote participants,
		// and now there are no remote participants for an extended period
		if (
			wasJoinedSuccessfully &&
			callState === "joined-meeting" &&
			remoteParticipantIds.length === 0 &&
			!isEnding &&
			!unexpectedDisconnectRef.current
		) {
			// Set a timer to check if remote participant reconnects
			const noRemoteParticipantTimer = setTimeout(() => {
				if (
					mountedRef.current &&
					callState === "joined-meeting" &&
					remoteParticipantIds.length === 0 &&
					wasJoinedSuccessfully &&
					!isEnding &&
					!unexpectedDisconnectRef.current
				) {
					console.log(
						"Unexpected disconnection - tutor left and didn't return"
					);
					handleUnexpectedDisconnection();
				}
			}, 10000); // Wait 10 seconds for tutor to potentially reconnect

			return () => clearTimeout(noRemoteParticipantTimer);
		}
	}, [
		remoteParticipantIds.length,
		callState,
		wasJoinedSuccessfully,
		isEnding,
		handleUnexpectedDisconnection,
	]);

	// Optimized toggle functions
	const toggleMute = useCallback(() => {
		if (callObject && callState === "joined-meeting") {
			const newMutedState = !isMuted;
			callObject.setLocalAudio(!newMutedState);
			setIsMuted(newMutedState);
		}
	}, [callObject, isMuted, callState]);

	const toggleSubtitles = useCallback(() => {
		setShowSubtitles((prev) => !prev);
	}, []);

	// Normal end call function (user initiated)
	const handleEndCall = useCallback(async () => {
		if (isEnding || cleanupRef.current || unexpectedDisconnectRef.current)
			return;

		console.log("Ending call normally...");
		setIsEnding(true);
		cleanupRef.current = true;

		try {
			// Stop transcription first
			if (isRecording) {
				stopTranscribing();
			}

			// Update session status to "COMPLETED" for normal end
			await sessionService.updateSessionCall(
				"conversation_id",
				conversationId,
				{
					status: "COMPLETED", // Normal completion
				}
			);

			// Leave and destroy call
			if (callObject) {
				await callObject.leave();
				// Small delay before destroy
				setTimeout(async () => {
					try {
						await callObject.destroy();
					} catch (error) {
						console.warn("Error destroying call object:", error);
					}
				}, 500);
			}

			// Navigate after cleanup
			setTimeout(() => {
				navigate("/dashboard/session/history", {
					state: {
						conversationId,
						normalEnd: true,
					},
					replace: true,
				});
			}, 1000);
		} catch (error) {
			console.error("Error ending call:", error);
			// Force navigation even on error
			navigate("/dashboard/session/history", {
				state: {
					conversationId,
					normalEnd: true,
				},
				replace: true,
			});
		}
	}, [
		callObject,
		isRecording,
		stopTranscribing,
		navigate,
		conversationId,
		isEnding,
	]);

	// Improved status message function
	const getCallStatusMessage = useCallback(() => {
		if (connectionError) return connectionError;
		if (isEnding) return "Ending call...";
		if (isReconnecting) return "Reconnecting...";

		switch (callState) {
			case "new":
				return "Initializing...";
			case "joining-meeting":
				return "Connecting...";
			case "joined-meeting":
				return remoteParticipantIds.length > 0
					? null
					: "Waiting for tutor...";
			case "left-meeting":
				return "Call ended";
			case "error":
				return "Connection error - Retrying...";
			default:
				return "Connecting...";
		}
	}, [
		callState,
		remoteParticipantIds.length,
		isEnding,
		connectionError,
		isReconnecting,
	]);

	const statusMessage = getCallStatusMessage();

	// Check if buttons should be disabled
	const buttonsDisabled =
		callState !== "joined-meeting" || isEnding || isReconnecting;
	const showReconnectButton =
		connectionError && joinAttempts >= 3 && !isJoining && !isReconnecting;

	return (
		<div className='flex flex-col px-6 pt-6 bg-zinc-950 min-h-screen gap-2'>
			<div className='flex-1 rounded-2xl relative overflow-hidden'>
				<div className='absolute h-full inset-0 w-full bg-gradient-to-br from-blue-600 to-blue-800 z-10'>
					{remoteParticipantIds.length > 0 ? (
						<DailyVideo
							key={remoteParticipantIds[0]}
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
							<div className='flex items-center justify-center h-full text-white'>
								<div className='text-center'>
									<p className='text-2xl font-light mb-4'>
										{statusMessage}
									</p>
									{(isJoining ||
										isReconnecting ||
										callState === "joining-meeting") && (
										<div className='flex justify-center'>
											<LoadingSpinner
												size='32px'
												color='white'
												speed='1s'
											/>
										</div>
									)}
									{showReconnectButton && (
										<button
											onClick={handleReconnect}
											className='mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto'>
											<RefreshCw className='w-5 h-5' />
											Reconnect
										</button>
									)}
								</div>
							</div>
						)
					)}
				</div>

				{localSessionId && (
					<div className='absolute h-[30%] w-[25%] right-7 bottom-20 bg-gray-800 z-20 rounded-2xl overflow-hidden border-2 border-gray-300 shadow-2xl'>
						<DailyVideo
							key={localSessionId}
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

				{showSubtitles &&
					transcript &&
					transcript !== "Starting transcription..." && (
						<div className='absolute bottom-10 left-1/2 bg-black/60 -translate-x-1/2 z-20 rounded-xl backdrop-blur-lg max-w-[80%]'>
							<p className='px-4 py-2 text-white text-lg'>
								{transcript}
							</p>
						</div>
					)}
			</div>

			<div className='flex h-[8vh] my-1 justify-between items-center relative'>
				<div className='flex items-center gap-1 text-md'>
					<span className='text-white'>
						{new Date().toLocaleTimeString()}
					</span>
					<img
						className='w-6 opacity-70'
						src='/icons/divider.svg'
						alt=''
					/>
					<span className='text-white opacity-70'>{conversationId}</span>
				</div>

				<div className='flex items-center gap-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
					<button
						onClick={toggleMute}
						disabled={buttonsDisabled}
						className={`p-4 rounded-full transition-all ${
							isMuted
								? "bg-red-600 hover:bg-red-700"
								: "bg-gray-700 hover:bg-gray-600"
						} ${buttonsDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
						{isMuted ? (
							<MicOff className='w-6 h-6 text-white' />
						) : (
							<Mic className='w-6 h-6 text-white' />
						)}
					</button>

					<button
						onClick={toggleSubtitles}
						disabled={
							buttonsDisabled || remoteParticipantIds.length === 0
						}
						className={`p-4 rounded-full transition-all ${
							showSubtitles
								? "bg-blue-600 hover:bg-blue-700"
								: "bg-gray-700 hover:bg-gray-600"
						} ${
							buttonsDisabled || remoteParticipantIds.length === 0
								? "opacity-50 cursor-not-allowed"
								: ""
						}`}>
						<RiClosedCaptioningFill className='w-6 h-6 text-white' />
					</button>

					<button
						onClick={handleEndCall}
						disabled={isEnding}
						className={`p-4 px-7 rounded-full bg-red-600 hover:bg-red-700 transition-all ml-2 ${
							isEnding ? "opacity-50 cursor-not-allowed" : ""
						}`}>
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
					<div
						onClick={() => navigate("/")}
						className='bg-zinc-900 p-4 noice flex items-center justify-center rounded-full relative'>
						<img
							src='/icons/bubble-chat.svg'
							alt=''
							className='absolute -left-3 -top-2 w-8'
						/>
						<img
							src='/icons/logo.png'
							alt=''
							className='w-6 h-6 block'
						/>
					</div>
				</div>
			</div>

			<DailyAudio />
		</div>
	);
};

// Optimized SessionCall with forced re-mount on URL change
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
						onClick={() => (window.location.href = "/dashboard")}
						className='px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'>
						Return to Dashboard
					</button>
				</div>
			</div>
		);
	}

	console.log("SessionCall rendering with URL:", conversationUrl);

	// Force provider re-mount when URL changes by using key
	return (
		<DailyProvider
			key={conversationUrl}
			url={conversationUrl}>
			<SessionCallContent
				conversationId={conversationId}
				conversationUrl={conversationUrl}
			/>
		</DailyProvider>
	);
};

export default SessionCall;
