import { motion } from "framer-motion";
import { Video, VideoOff } from "lucide-react";

import { useNavigate } from "react-router";

function InValidSession() {
	const navigate = useNavigate();
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='w-full max-w-md bg-white rounded-2xl shadow-xl p-5 text-center py-12 ring-8 ring-offset-white/70 z-30'>
			<div className='mb-6'>
				<motion.div
					className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm ring-8 ring-red-100/40'
					initial={{ scale: 0.8 }}
					animate={{
						scale: [0.8, 1.1, 1],
						rotate: [0, -10, 10, -10, 0],
					}}
					transition={{
						duration: 1.5,
						ease: "easeInOut",
						times: [0, 0.4, 1],
					}}>
					<motion.div
						animate={{
							opacity: [1, 0.7, 1],
							scale: [1, 0.95, 1],
						}}
						transition={{
							duration: 2,
						}}>
						<VideoOff className='w-9 h-9 text-red-600' />
					</motion.div>
				</motion.div>
				<h1 className='text-2xl font-semibold text-gray-700 mb-3 font-montserrat'>
					Session Not Found
				</h1>
				<p className='text-gray-500 w-[90%] mx-auto text-md px-2 '>
					This learning session is no longer available. Check your link or
					create a new session.
				</p>
			</div>

			<div className='space-y-5 mt-12'>
				<button
					onClick={() => navigate("/dashboard/session/create")}
					className='w-fit px-6 py-3 rounded-lg mx-auto bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3 text-app-offwhite'>
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
						<Video className='w-6 h-6' />
					</motion.div>
					Create New Session
				</button>
				<button
					onClick={() => navigate("/dashboard")}
					className='w-full bg-transparent text-gray-800 underline text-sm'>
					Go to Dashboard
				</button>
			</div>
		</motion.div>
	);
}

export default InValidSession;
