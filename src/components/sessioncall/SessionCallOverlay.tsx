import { motion } from "framer-motion";
import BoltBadge from "../common/BoltBadge";
import { ReactNode } from "react";

type SessionCallOverlayProps = {
	children: ReactNode;
};

const SessionCallOverlay: React.FC<SessionCallOverlayProps> = (props) => {
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

			{props.children}
		</div>
	);
};

export default SessionCallOverlay;
