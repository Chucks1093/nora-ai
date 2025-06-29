import { motion } from "framer-motion";

import { LogIn, Video } from "lucide-react";

import { useNavigate } from "react-router";

function UnAuthenticatedUser() {
	const navigate = useNavigate();
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center py-14 ring-8 ring-offset-white/95 z-30'>
			<div className='mb-6'>
				<motion.div
					className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm ring-8 ring-blue-100/40'
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
						<Video className='w-9 h-9 text-blue-600' />
					</motion.div>
				</motion.div>
				<h1 className='text-2xl font-semibold text-gray-700 mb-3 font-montserrat'>
					Join Learning Session
				</h1>
				<p className='text-gray-500 w-[90%] mx-auto text-md '>
					Sign in or Register to join this interactive tutoring session
					with Nora AI .
				</p>
			</div>

			<div className='space-y-5 mt-12'>
				<button
					onClick={() => navigate("/dashboard/session/create")}
					className='w-fit px-6 py-3 rounded-lg mx-auto bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3 text-app-offwhite'>
					<motion.div>
						<LogIn className='w-6 h-6' />
					</motion.div>
					Sign In to Join
				</button>
				<button
					onClick={() => navigate("/dashboard")}
					className='w-fit bg-transparent text-gray-500 underline text-sm'>
					Create Account
				</button>
			</div>
		</motion.div>
	);
}

export default UnAuthenticatedUser;
