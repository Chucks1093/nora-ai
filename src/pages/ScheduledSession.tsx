import React from "react";
import { motion } from "framer-motion";

import { CalendarPlus } from "lucide-react";
import ScheduledSessionTable from "@/components/dashboard/ScheduledSessionTable";

const ScheduledSession: React.FC = () => {
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
						<CalendarPlus className='w-9 h-9 text-blue-500' />
						Scheduled Sessions
					</h1>
					<p className='text-gray-600'>
						View your upcoming learning sessions with Nora AI
					</p>
				</div>
			</motion.div>

			{/* Session Table */}
			<motion.div
				initial={{ opacity: 0, y: 25 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}>
				<ScheduledSessionTable />
			</motion.div>
		</motion.div>
	);
};

export default ScheduledSession;
