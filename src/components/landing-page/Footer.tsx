import { AtSign, Github } from "lucide-react";
import { motion } from "framer-motion";

function Footer() {
	return (
		<footer className='relative bg-[#FFF1E6FF]'>
			<motion.div className='flex flex-col md:flex-row gap-12 items-center mx-auto w-full justify-center min-w-[22rem] translate-y-[5.3rem] relative z-20 '>
				<motion.div
					className='bg-[#fafafa] md:px-14  py-6 md:py-8 rounded-lg shadow-lg border-4 border-white w-[90%] md:w-auto md:min-w-[22rem]'
					whileHover={{ y: -5, scale: 1.02 }}
					transition={{ type: "spring", stiffness: 400, damping: 17 }}>
					<div>
						<motion.img
							src='/images/hi-study.png'
							alt=''
							className='block w-[13rem] h-[15rem] object-contain mx-auto'
							whileHover={{ scale: 1.05, rotate: 2 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 17,
							}}
						/>
					</div>
					<div className='text-center space-y-4 mt-2'>
						<p className='font-montserrat text-2xl font-semibold '>
							Got Suggestions?
						</p>
						<motion.a
							href='mailto:noraaitutor@gmail.com'
							className='bg-app-primary text-white font-montserrat px-4 py-2 rounded-lg  mx-auto no-underline inline-flex justify-center'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 17,
							}}>
							Email Us
						</motion.a>
					</div>
				</motion.div>

				<motion.div
					className='bg-[#fafafa] md:px-14  py-6 md:py-8 rounded-lg shadow-lg border-4 border-white w-[90%] md:w-auto md:min-w-[22rem]'
					whileHover={{ y: -5, scale: 1.02 }}
					transition={{ type: "spring", stiffness: 400, damping: 17 }}>
					<div>
						<motion.img
							src='/images/png-output.png'
							alt=''
							className='block w-[12rem] h-[15rem] object-contain mx-auto'
							whileHover={{ scale: 1.05, rotate: -2 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 17,
							}}
						/>
					</div>
					<div className='text-center space-y-4 mt-2'>
						<p className='font-montserrat text-2xl font-semibold'>
							Want More Info?
						</p>
						<motion.a
							href='https://x.com/noratutor'
							target='_blank'
							className='bg-app-primary text-white font-montserrat px-4 py-2 rounded-lg block mx-auto w-fit'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 17,
							}}>
							Check Our Page
						</motion.a>
					</div>
				</motion.div>
			</motion.div>

			<div className='bg-app-primary  overflow-x-hidden overflow-y-hidden relative noice pt-[10rem] z-10 '>
				<div className='md:mb-[13rem] mb-[5rem] max-w-6xl mx-auto  '>
					<div className='mb-8 flex flex-col md:flex-row gap-8 justify-between items-center'>
						<p className='text-[#ffffffd5] text-md'>
							&copy; {new Date().getFullYear()} Onboard. All rights
							reserved.
						</p>
						<div className='flex items-center gap-5'>
							<a
								href='https://github.com/chucks1093/nora-ai'
								target='_blank'
								className='p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all duration-200 flex'>
								<Github className='w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200' />
							</a>
							<a
								href='mailto:noraaitutor@gmail.com'
								target='_blank'
								className='p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all duration-200 flex'>
								<AtSign className='w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200' />
							</a>

							<a
								href='https://x.com/noratutor'
								target='_blank'
								className='p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all duration-200 flex'>
								<img
									src='/icons/x.svg'
									className='w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200'
									alt=''
								/>
							</a>
						</div>
					</div>
					<hr className='hidden md:block border border-[#f1f1f168]' />
				</div>
				<div className='flex items-center gap-2 w-full justify-center absolute left-1/2 bottom-0 translate-y-[48%] -translate-x-1/2  max-w-7xl '>
					<img
						src='/icons/logo.svg'
						alt=''
						className='md:h-[23rem] h-[5rem] mb-2'
					/>
					<p className='text-white font-marlin font-bold text-[4rem] md:text-[18rem] whitespace-nowrap'>
						Nora AI
					</p>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
