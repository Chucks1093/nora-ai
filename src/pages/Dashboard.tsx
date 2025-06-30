import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	CalendarPlus,
	Clock,
	GraduationCap,
	LayoutPanelTop,
	Video,
} from "lucide-react";
import SessionMetrics from "@/components/dashboard/SessionMetrics";
import SessionMetricsSkeleton from "@/components/dashboard/SessionMetricsSkeleton";
import { TutoringSessionsChart } from "@/components/dashboard/BarChatAnalytics";
import { sessionService } from "@/services/session.service";
import { useProfileStore } from "@/hooks/dashboard/useProfileStore";
import showToast from "@/utils/toast.utils";

// Interface for session stats
interface UserSessionStats {
	user_id: string;
	total_sessions: number;
	scheduled_sessions: number;
	ended_sessions: number;
	total_duration: number;
}

const Dashboard: React.FC = () => {
	const [sessionStats, setSessionStats] = useState<UserSessionStats | null>(
		null
	);
	const [isLoadingStats, setIsLoadingStats] = useState(true);
	const { profile } = useProfileStore();

	// Helper function to format duration (assuming duration is in minutes)
	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${mins}m`;
	};

	// Fetch session statistics
	useEffect(() => {
		const fetchSessionStats = async () => {
			if (!profile?.id) {
				setIsLoadingStats(false);
				return;
			}

			try {
				setIsLoadingStats(true);
				const stats = await sessionService.getUserSessionStats(profile.id);
				setSessionStats(stats);
			} catch (error) {
				console.error("Error fetching session stats:", error);
				showToast.error("Failed to load session statistics");
				// Set default stats on error
				setSessionStats({
					user_id: profile.id,
					total_sessions: 0,
					scheduled_sessions: 0,
					ended_sessions: 0,
					total_duration: 0,
				});
			} finally {
				setIsLoadingStats(false);
			}
		};

		fetchSessionStats();
	}, [profile?.id]);

	// Calculate growth percentages (you can implement this based on your previous period data)
	const getGrowthPercentage = (current: number, type: string) => {
		console.log(current);
		// This is a placeholder - you can implement actual growth calculation
		// based on comparing with previous period data
		const growthRates = {
			sessions: "+15.2%",
			scheduled: "+8.4%",
			hours: "+23.1%",
			completed: "+18.7%",
		};
		return growthRates[type as keyof typeof growthRates] || "+0%";
	};

	return (
		profile && (
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
							<LayoutPanelTop className='w-8 h-8 text-blue-500' />
							Dashboard
						</h1>
						<p className='text-gray-600'>
							Track your learning analytics and conversation metrics with
							Nora AI
						</p>
					</div>
				</motion.div>

				{/* Session Statistics */}
				<motion.div
					initial={{ opacity: 0, y: 25 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}>
					<div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
						{isLoadingStats ? (
							// Show skeleton loading state
							<>
								<SessionMetricsSkeleton />
								<SessionMetricsSkeleton />
								<SessionMetricsSkeleton />
								<SessionMetricsSkeleton />
							</>
						) : (
							// Show actual data
							<>
								<SessionMetrics
									icon={<Video />}
									title='Total Sessions'
									value={sessionStats?.total_sessions || 0}
									growth={getGrowthPercentage(
										sessionStats?.total_sessions || 0,
										"sessions"
									)}
								/>
								<SessionMetrics
									icon={<CalendarPlus />}
									title='Scheduled Calls'
									value={sessionStats?.scheduled_sessions || 0}
									growth={getGrowthPercentage(
										sessionStats?.scheduled_sessions || 0,
										"scheduled"
									)}
								/>
								<SessionMetrics
									icon={<Clock />}
									title='Study Hours'
									value={sessionStats?.total_duration || 0}
									displayValue={formatDuration(
										sessionStats?.total_duration || 0
									)}
									growth={getGrowthPercentage(
										sessionStats?.total_duration || 0,
										"hours"
									)}
								/>
								<SessionMetrics
									icon={<GraduationCap />}
									title='Completed Lessons'
									value={sessionStats?.ended_sessions || 0}
									growth={getGrowthPercentage(
										sessionStats?.ended_sessions || 0,
										"completed"
									)}
								/>
							</>
						)}
					</div>

					{/* Chart */}
					<div>
						<TutoringSessionsChart
							chartStyles='w-full h-[24rem] px-8 pt-3 pb-8 rounded-[.8rem] '
							cardStyles='rounded-[.7rem] border border-borderColor mt-8 '
							cardContentStyles='p-0'
							cardHeaderStyles=''
							userId={profile?.id}
						/>
					</div>
				</motion.div>
			</motion.div>
		)
	);
};

export default Dashboard;
