import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
function SessionMaterials() {
	return (
		<motion.div
			className='max-w-7xl mx-auto p-6 pt-10'
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}>
			{/* Header */}
			<motion.div
				className='flex justify-between items-center mb-8'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}>
				<div>
					<h1 className='text-3xl font-marlin font-bold text-gray-700 mb-2 flex items-center gap-3'>
						<BookOpen className='w-8 h-8 text-blue-500' />
						My Learning Materials
					</h1>
					<p className='text-gray-600'>
						View, organize, and manage all your uploaded study resources
						and documents in one place
					</p>
				</div>
			</motion.div>
			<div className=' w-full flex flex-col items-center  mt-16'>
				<img
					src='/images/materials.png'
					alt=''
					className='w-[27%]'
				/>
				<h1 className='font-marlin text-gray-700 font-medium mt-4 text-[2rem]'>
					Coming Soon
				</h1>
				<p className='text-gray-600'>
					Our team is working to bring this amazing feature to you
				</p>
			</div>
		</motion.div>
	);
}

export default SessionMaterials;
