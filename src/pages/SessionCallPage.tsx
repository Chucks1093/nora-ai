import React, { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import {
	Video,
	VideoOff,
	Mic,
	MicOff,
	Settings,
	Clock,
	Calendar,
	ExternalLink,
	ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/date.utils";
import { motion } from "framer-motion";

// Import your actual call component
import SessionCallContent from "@/components/sessioncall/SessionCallContent"; // The component you showed earlier
import UnAuthenticatedUser from "@/components/sessioncall/UnAuthenticatedUser";
import InValidSession from "@/components/sessioncall/InValidSession";
import BoltBadge from "@/components/common/BoltBadge";

interface LoaderData {
	user: {
		authenticated: boolean;
		id?: string;
		username?: string;
		email?: string;
	};
	session?: {
		id: string;
		created_at: string;
		description?: string;
		status: string;
		duration: number;
		url: string;
		context: string;
		tutor: string;
		replica_id: string;
		tutor_image: string;
		title: string;
		isValid?: boolean;
	};
	isValid?: boolean;
}

const SessionCallPage: React.FC = () => {
	const loaderData = useLoaderData() as LoaderData;
	const navigate = useNavigate();
	const [isJoining, setIsJoining] = useState(false);
	const [inCall, setInCall] = useState(false);
	const [cameraEnabled, setCameraEnabled] = useState(true);
	const [micEnabled, setMicEnabled] = useState(true);

	const SessionCallModal = () => {
		// Not Authenticated Scenario
		if (!loaderData.user.authenticated) {
			return <UnAuthenticatedUser />;
		}

		// Invalid Session Scenario
		if (
			!loaderData.session ||
			!loaderData.isValid ||
			!loaderData.session.isValid
		) {
			return <InValidSession />;
		}

		const session = loaderData.session;
		const created = formatDateTime(session.created_at);

		// In Call - Show the actual call interface
		if (inCall) {
			return (
				<SessionCallContent
					conversationUrl={session.url}
					sessionData={session}
					onLeaveCall={() => setInCall(false)}
				/>
			);
		}
	};

	// Pre-Call Screen - Valid session, ready to join
	return (
		<div className='min-h-screen bg-app-primary noice relative overflow-hidden w-full flex items-center justify-center p-4 '>
			<motion.img
				initial={{ opacity: 0, x: -50 }}
				animate={{
					opacity: 1,
					x: 0,
					y: [0, -10, 0],
					rotate: [0, 5, 0],
				}}
				transition={{
					opacity: { duration: 0.8 },
					x: { duration: 0.8 },
					y: {
						repeat: Infinity,
						duration: 4,
						ease: "easeInOut",
					},
					rotate: {
						repeat: Infinity,
						duration: 5,
						ease: "easeInOut",
					},
				}}
				className='absolute top-[20%] left-[5%] invert-[.9] w-[5rem]'
				src='/icons/kite.svg'
				alt='Kite'
			/>
			<motion.img
				initial={{ opacity: 0, x: 50 }}
				animate={{
					opacity: 1,
					x: 0,
					y: [0, -8, 0],
					rotate: [0, -3, 0],
				}}
				transition={{
					opacity: { duration: 0.8 },
					x: { duration: 0.8 },
					y: {
						repeat: Infinity,
						duration: 5,
						ease: "easeInOut",
					},
					rotate: {
						repeat: Infinity,
						duration: 4,
						ease: "easeInOut",
					},
				}}
				className='absolute top-[15%] right-[10%] invert-[.9] w-[5rem] o'
				src='/icons/custom-learning.svg'
				alt='Custom Learning'
			/>

			<div className='flex items-center space-x-4 .mt-7 absolute left-1/2 -translate-x-1/2 bottom-[20%] md:bottom-10'>
				<a
					href='https://x.com/noratutor'
					target='_blank'
					className='p-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all duration-200 group'>
					<img
						src='/icons/logo.png'
						className='w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200'
						alt=''
					/>
				</a>
			</div>
			<motion.img
				initial={{ opacity: 0, y: 100 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1, delay: 0.3 }}
				className='md:w-[26rem] w-[18rem] absolute md:-bottom-24 -bottom-[10rem] -right-[8%]'
				src='/icons/bolt.svg'
				alt='Bolt'
			/>

			<BoltBadge />

			<SessionCallModal />
		</div>
	);
};

export default SessionCallPage;
