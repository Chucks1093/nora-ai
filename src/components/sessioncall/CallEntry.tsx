import { Session } from "@/services/session.service";
import { motion } from "framer-motion";

import { Clock, PhoneCall } from "lucide-react";

import { useNavigate } from "react-router";

type CallEntryProps = {
	setInCall: React.Dispatch<React.SetStateAction<boolean>>;
};

const CallEntry: React.FC<Session & CallEntryProps> = (props) => {
	const navigate = useNavigate();
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='w-full max-w-md bg-white rounded-2xl shadow-xl px-8  py-14 ring-8 ring-offset-white/70 z-30'>
			<div className='mb-7 flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<img
						src={props.tutor_image}
						alt={`${props.tutor} avatar`}
						className='w-16 h-16 rounded-full object-cover border-4 border-gray-200 '
						onError={(e) => {
							e.currentTarget.src = "/images/default-avatar.jpg";
						}}
					/>
					<div>
						<p className='text-xl font-montserrat font-medium text-gray-900 mb-1'>
							{props.tutor}
						</p>
						<p className='text-sm text-gray-500'>
							{props.tutor_personality}
						</p>
					</div>
				</div>
				<div
					className={`justify-center gap-1 flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-600`}>
					<Clock className='h-4 w-4 ' />
					<span className='text-md font-medium'>5 Minutes</span>
				</div>
			</div>

			<div className='mb-6'>
				<h1 className='text-2xl font-semibold text-gray-700 mb-3 font-montserrat'>
					{props.title}
				</h1>
				<p className='text-gray-500 text-md  '>{props.description}</p>
			</div>

			<div className='space-y-5 mt-12'>
				<button
					onClick={() => navigate("/dashboard/session/create")}
					className='w-full px-6 py-3 rounded-lg mx-auto bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3 text-app-offwhite'>
					<motion.div
						animate={{
							scale: [1, 1.2, 1],
							rotate: [0, 5, 0, -5, 0],
						}}
						transition={{
							duration: 1.8,
							repeat: Infinity,
							ease: "easeInOut",
						}}>
						<PhoneCall className='w-5 h-5' />
					</motion.div>
					Join Call
				</button>
				<button
					onClick={() => navigate("/dashboard")}
					className='w-full bg-transparent text-gray-700 underline text-sm'>
					Go to Dashboard
				</button>
			</div>
		</motion.div>
	);
};

export default CallEntry;
