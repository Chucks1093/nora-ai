import { useState, useRef, useEffect } from "react";
import {
	ChevronRight,
	Info,
	Video,
	Play,
	Pause,
	Clock,
	Calendar,
	PlayCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import useCall from "@/hooks/dashboard/useCall";
import showToast from "@/utils/toast.utils";
import { env } from "@/utils/env.utils";
import { sessionService } from "@/services/session.service";
import { useProfileStore } from "@/hooks/dashboard/useProfileStore";

const availabletutors = [
	{
		replica_id: "r3a47ce45e68",
		personal_id: "p2f164e98f54",
		image: "/images/avatar-1_thumbnail.jpg",
		video: `${env.VITE_SUPABASE_URL}/storage/v1/object/public/content/tutors/preview/avatar-1.mp4`,
		name: "Nora",
		personality: "Builds you up slowly",
	},
	{
		replica_id: "r6ca16dbe104",
		personal_id: "pd250e4ad1f6",
		image: "/images/avatar-2_thumbnail.jpg",
		video: `${env.VITE_SUPABASE_URL}/storage/v1/object/public/content/tutors/preview/avatar-2.mp4`,
		name: "Mary",
		personality: "Chats with high energy",
	},
	{
		replica_id: "rca8a38779a8",
		personal_id: "p0e169a72068",
		image: "/images/avatar-3_thumbnail.jpg",
		video: `${env.VITE_SUPABASE_URL}/storage/v1/object/public/content/tutors/preview/avatar-3.mp4`,
		name: "Carter",
		personality: "Loves digging into details",
	},
];

const CreateSession = () => {
	const { profile } = useProfileStore();
	const [conversationContext, setConversationContext] = useState("");
	const [selectedTutorIndex, setSelectedTutorIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [showControls, setShowControls] = useState(true);
	const [sessionDuration, setSessionDuration] = useState("5");
	const [sessionTiming, setSessionTiming] = useState("immediate"); // "immediate" or "scheduled"
	const [scheduledDate, setScheduledDate] = useState("");
	const [scheduledTime, setScheduledTime] = useState("");
	const videoRef = useRef<HTMLVideoElement>(null);
	const navigate = useNavigate();
	const { error, makeCall } = useCall();
	const [isLoading, setIsLoading] = useState(false);

	// Get today's date in YYYY-MM-DD format for min date
	const today = new Date().toISOString().split("T")[0];

	const handleTutorSelected = (index: number) => {
		setSelectedTutorIndex(index);
		setIsPlaying(false);
		if (videoRef.current) {
			videoRef.current.pause();
		}
	};

	const togglePlayPause = () => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause();
				setIsPlaying(false);
			} else {
				videoRef.current.play();
				setIsPlaying(true);
			}
		}
	};

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedTime = e.target.value;

		// Only validate if selected date is today
		if (scheduledDate === today) {
			const now = new Date();
			const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
			const selectedDateTime = new Date(`${scheduledDate}T${selectedTime}`);

			if (selectedDateTime < tenMinutesFromNow) {
				showToast.error(
					"Please select a time at least 10 minutes from now"
				);
				return; // Don't set the time
			}
		}

		setScheduledTime(selectedTime);
	};

	const handleCreateSession = async () => {
		if (!conversationContext.trim()) {
			showToast.error("Please provide a learning context");
			return;
		}

		showToast.message("working");

		if (sessionTiming === "scheduled") {
			if (!scheduledDate || !scheduledTime) {
				showToast.error(
					"Please select both date and time for scheduled session"
				);
				return;
			}
		}

		try {
			setIsLoading(true);
			const { title, description } = await sessionService.getTitle(
				conversationContext
			);
			const result = await makeCall(
				conversationContext,
				availabletutors[selectedTutorIndex].replica_id,
				availabletutors[selectedTutorIndex].personal_id
			);
			if (!profile)
				return showToast.error(
					"Only Authenticated user can create sessions"
				);

			if (!result) return showToast.error("Error scheduling call");

			let dateTime: string | null = null;

			if (sessionTiming !== "immediate") {
				const dateTimeString = `${scheduledDate}T${scheduledTime}`;
				const isoDate = new Date(dateTimeString);
				dateTime = isoDate.toDateString();
			}

			const status =
				sessionTiming == "immediate" ? "IN_PROGRESS" : "SCHEDULED";

			await sessionService.createsession({
				id: result.conversation_id,
				user_id: profile.id,
				status: status,
				duration: Number(sessionDuration),
				context: conversationContext,
				tutor: availabletutors[selectedTutorIndex].name,
				replica_id: availabletutors[selectedTutorIndex].replica_id,
				personal_id: availabletutors[selectedTutorIndex].personal_id,
				tutor_image: availabletutors[selectedTutorIndex].image,
				tutor_personality: availabletutors[selectedTutorIndex].personality,
				url: result.conversation_url,
				title: title,
				time: dateTime,
				description: description,
				conversation_id: result.conversation_id,
			});
			if (result.conversation_url) {
				if (sessionTiming === "immediate") {
					showToast.success(
						`Starting Call with ${availabletutors[selectedTutorIndex].name}`
					);
					navigate(`/session/call/${result.conversation_id}?incall=true`, {
						state: { conversationUrl: result.conversation_url },
					});
				} else {
					// For scheduled sessions, show success message instead of navigating
					showToast.success(
						`Session scheduled for ${scheduledDate} at ${scheduledTime}. You'll receive a reminder!`
					);
					// Optionally redirect to dashboard or sessions list
					// navigate("/dashboard");
				}
			}
		} catch (err) {
			console.error("Failed to create session:", err);
		} finally {
			setIsLoading(false);
		}
	};

	// Use useEffect to handle error display
	useEffect(() => {
		if (error) {
			showToast.error(error);
		}
	}, [error]);

	return (
		<motion.div
			className='max-w-7xl mx-auto px-6 py-8 space-y-8'
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}>
			{/* Header */}
			<motion.div
				className='text-center space-y-2'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}>
				<div className='flex items-center gap-3 text-blue-500 mb-2'>
					<Video size={46} />
					<h1 className='font-marlin font-bold text-3xl text-gray-600'>
						Create New Session
					</h1>
				</div>
				<p className='hidden text-gray-600 text-md text-left'>
					Choose your AI tutor and start learning
				</p>
			</motion.div>

			<motion.div
				className='grid lg:grid-cols-2 gap-8'
				initial={{ opacity: 0, y: 25 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}>
				{/* Left Panel */}
				<div className='space-y-6'>
					{/* Tutor Selection */}
					<div className='bg-white p-6 rounded-2xl border shadow-sm'>
						<Label className='block text-lg font-semibold text-gray-800 mb-4'>
							Select Your Tutor
						</Label>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{availabletutors.map((tutor, i) => (
								<motion.div
									key={tutor.replica_id}
									className={`relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
										selectedTutorIndex === i
											? "ring-2 ring-blue-500 border-blue-500 shadow-lg"
											: "border-gray-200 hover:border-gray-300  hover:brightness-90"
									}`}
									onClick={() => handleTutorSelected(i)}
									whileTap={{ scale: 0.98 }}>
									<div className='aspect-square'>
										<img
											src={tutor.image}
											alt={tutor.name}
											className='w-full h-full object-cover'
										/>
									</div>
									<div className='p-3 bg-white'>
										<p className='font-semibold text-gray-800 text-sm'>
											{tutor.name}
										</p>
										<p className=' text-xs text-gray-500 mt-1'>
											{tutor.personality}
										</p>
									</div>
									{selectedTutorIndex === i && (
										<div className='absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center'>
											<div className='w-2 h-2 bg-white rounded-full'></div>
										</div>
									)}
								</motion.div>
							))}
						</div>
					</div>

					{/* Session Timing */}
					<div className='bg-white p-6 rounded-2xl border shadow-sm'>
						<Label className='block text-lg font-semibold text-gray-800 mb-4'>
							When would you like to start?
						</Label>
						<div className='space-y-4'>
							<div className='flex gap-4 md:flex-row flex-col'>
								<button
									type='button'
									onClick={() => setSessionTiming("immediate")}
									className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
										sessionTiming === "immediate"
											? "border-blue-500 bg-blue-50 text-blue-700"
											: "border-gray-200 hover:border-gray-300 text-gray-700"
									}`}>
									<div className='flex items-center gap-3'>
										<PlayCircle className='w-8 h-8' />
										<div className='text-left'>
											<p className='font-medium text-sm '>
												Start Now
											</p>
											<p className='text-xs opacity-70'>
												Begin session immediately
											</p>
										</div>
									</div>
								</button>
								<button
									type='button'
									onClick={() => setSessionTiming("scheduled")}
									className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
										sessionTiming === "scheduled"
											? "border-blue-500 bg-blue-50 text-blue-700"
											: "border-gray-200 hover:border-gray-300 text-gray-700"
									}`}>
									<div className='flex items-center gap-3'>
										<Calendar className='w-8 h-8' />
										<div className='text-left'>
											<p className='font-medium text-sm '>
												Schedule
											</p>
											<p className='text-xs opacity-70'>
												Choose date & time
											</p>
										</div>
									</div>
								</button>
							</div>

							{/* Scheduling Options */}
							{sessionTiming === "scheduled" && (
								<motion.div
									className='grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl'
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									transition={{ duration: 0.3 }}>
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Date
										</label>
										<input
											type='date'
											min={today}
											value={scheduledDate}
											onChange={(e) =>
												setScheduledDate(e.target.value)
											}
											className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
										/>
									</div>
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Time
										</label>
										<input
											type='time'
											value={scheduledTime}
											onChange={handleTimeChange}
											className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
										/>
									</div>
								</motion.div>
							)}
						</div>
					</div>

					{/* Session Settings */}
					<div className='bg-white p-6 rounded-2xl border shadow-sm'>
						<Label className='block text-lg font-semibold text-gray-800 mb-4'>
							Session Settings
						</Label>
						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Duration
								</label>
								<div className='flex gap-2'>
									{["5", "10", "15"].map((duration) => (
										<button
											key={duration}
											type='button'
											onClick={() => setSessionDuration(duration)}
											className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
												sessionDuration === duration
													? "bg-blue-500 text-white"
													: "bg-gray-100 text-gray-700 hover:bg-gray-200"
											}`}>
											{duration} min
										</button>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Context Input */}
					<div className='bg-white p-6 rounded-2xl border shadow-sm'>
						<div className='flex items-center gap-2 mb-4'>
							<Label className='text-lg font-semibold text-gray-800'>
								Learning Context
							</Label>
							<Info className='w-4 h-4 text-gray-400' />
						</div>
						<textarea
							value={conversationContext}
							onChange={(e) => setConversationContext(e.target.value)}
							placeholder='What would you like to learn today? (e.g., "Help me understand calculus derivatives" or "Practice Spanish conversation")'
							rows={6}
							className='w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400'
						/>
					</div>

					{/* Create Button */}
					<motion.button
						type='button'
						onClick={handleCreateSession}
						disabled={isLoading || !conversationContext.trim()}
						className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
						whileTap={{ scale: isLoading ? 1 : 0.98 }}>
						{sessionTiming === "immediate" ? (
							<PlayCircle className='w-5 h-5' />
						) : (
							<Calendar className='w-5 h-5' />
						)}
						{isLoading
							? "Creating Session..."
							: sessionTiming === "immediate"
							? "Start Session Now"
							: "Schedule Session"}
						<ChevronRight className='w-5 h-5' />
					</motion.button>
				</div>

				{/* Right Panel - Preview */}
				<div className='bg-white p-6 rounded-2xl border shadow-sm h-fit'>
					<div className='flex items-center justify-between mb-6'>
						<h3 className='font-marlin font-bold text-xl text-gray-800'>
							Session Preview
						</h3>
						<div className='flex items-center gap-2 text-sm text-gray-500'>
							<Clock className='w-4 h-4' />
							{sessionDuration} minutes
						</div>
					</div>

					<div className='space-y-4'>
						{/* Video Preview */}
						<div
							className='relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer group'
							onMouseEnter={() => setShowControls(true)}
							onMouseLeave={() => setShowControls(false)}>
							<video
								ref={videoRef}
								loop
								playsInline
								controls={false}
								src={availabletutors[selectedTutorIndex].video}
								poster={availabletutors[selectedTutorIndex].image}
								className='w-full aspect-video object-cover'
							/>

							{/* Play/Pause Overlay */}
							<div
								className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
									showControls || !isPlaying
										? "opacity-100"
										: "opacity-0"
								}`}>
								<button
									onClick={togglePlayPause}
									type='button'
									className='bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-200 hover:scale-110 group-hover:scale-105'>
									{isPlaying ? (
										<Pause className='w-6 h-6' />
									) : (
										<Play className='w-6 h-6 ml-1' />
									)}
								</button>
							</div>

							{/* Status Badge */}
							<div className='absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm'>
								{isPlaying ? "Preview Playing" : "Click to Preview"}
							</div>
						</div>

						{/* Session Info */}
						<div className='bg-gray-50 p-4 rounded-xl space-y-3'>
							<div className='flex items-center justify-between'>
								<h4 className='font-semibold text-gray-800'>
									{availabletutors[selectedTutorIndex].name}
								</h4>
								<div className='flex items-center gap-1 text-sm text-gray-500'>
									<div className='w-2 h-2 bg-green-500 rounded-full'></div>
									Available Now
								</div>
							</div>

							<p className='text-sm text-gray-600'>
								{availabletutors[selectedTutorIndex].personality}
							</p>

							{/* Session Timing Display */}
							<div className='pt-2 border-t border-gray-200'>
								<div className='flex items-center gap-2 text-sm'>
									{sessionTiming === "immediate" ? (
										<>
											<PlayCircle className='w-4 h-4 text-green-500' />
											<span className='text-green-600 font-medium'>
												Starting immediately
											</span>
										</>
									) : (
										<>
											<Calendar className='w-4 h-4 text-blue-500' />
											<span className='text-blue-600 font-medium'>
												{scheduledDate && scheduledTime
													? `Scheduled for ${scheduledDate} at ${scheduledTime}`
													: "Scheduled session"}
											</span>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default CreateSession;
