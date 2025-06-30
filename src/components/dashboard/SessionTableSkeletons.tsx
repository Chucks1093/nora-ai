// SessionTableSkeletons.tsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

// Individual Card Skeleton for Grid View
const SessionCardSkeleton: React.FC<{ index: number }> = ({ index }) => {
	return (
		<motion.div
			className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.05 }}>
			{/* Card Header */}
			<div className='p-6 pb-4'>
				<div className='flex items-start justify-between mb-4'>
					<div className='flex items-center gap-3'>
						{/* Avatar */}
						<Skeleton className='w-12 h-12 rounded-full' />
						<div>
							{/* Name */}
							<Skeleton className='h-4 w-20 mb-1' />
							{/* Tutor ID */}
							<Skeleton className='h-3 w-16' />
						</div>
					</div>
					{/* Status Badge */}
					<Skeleton className='h-6 w-20 rounded-full' />
				</div>

				{/* Title */}
				<Skeleton className='h-5 w-full mb-2' />
				<Skeleton className='h-5 w-3/4 mb-3' />

				{/* Description */}
				<Skeleton className='h-4 w-full mb-1' />
				<Skeleton className='h-4 w-2/3' />
			</div>

			{/* Card Body */}
			<div className='px-6 pb-4 space-y-3'>
				{/* Date/Time */}
				<div className='flex items-center gap-4'>
					<div className='flex items-center gap-1'>
						<Skeleton className='w-4 h-4' />
						<Skeleton className='h-4 w-16' />
					</div>
					<div className='flex items-center gap-1'>
						<Skeleton className='w-4 h-4' />
						<Skeleton className='h-4 w-12' />
					</div>
				</div>

				{/* Bottom Actions */}
				<div className='flex items-center justify-between'>
					<Skeleton className='h-4 w-16' />
					<Skeleton className='w-8 h-8 rounded-full' />
				</div>
			</div>
		</motion.div>
	);
};

// Grid Skeleton
const SessionGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{Array.from({ length: count }, (_, index) => (
				<SessionCardSkeleton
					key={index}
					index={index}
				/>
			))}
		</div>
	);
};

// Table Row Skeleton
const SessionTableRowSkeleton: React.FC<{ index: number }> = ({ index }) => {
	return (
		<motion.tr
			className='bg-white hover:bg-gray-50 border-b border-gray-200 transition-colors'
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, delay: index * 0.05 }}>
			{/* Date/Time */}
			<td className='px-6 py-4'>
				<Skeleton className='h-4 w-20 mb-1' />
				<Skeleton className='h-3 w-16' />
			</td>

			{/* Tutor Info */}
			<td className='px-6 py-4'>
				<div className='flex items-center gap-3'>
					<Skeleton className='w-14 h-14 rounded-full' />
					<div>
						<Skeleton className='h-4 w-24 mb-1' />
						<Skeleton className='h-3 w-20' />
					</div>
				</div>
			</td>

			{/* Status */}
			<td className='px-6 py-4'>
				<Skeleton className='h-6 w-20 rounded-full' />
			</td>

			{/* Session Title */}
			<td className='px-6 py-4'>
				<Skeleton className='h-4 w-40' />
			</td>

			{/* Session Link */}
			<td className='px-6 py-4'>
				<Skeleton className='h-4 w-16' />
			</td>

			{/* Actions */}
			<td className='px-6 py-4'>
				<div className='flex justify-end'>
					<Skeleton className='w-8 h-8 rounded-full' />
				</div>
			</td>
		</motion.tr>
	);
};

// Table Skeleton
const SessionHeadSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
	return (
		<motion.div
			className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			<table className='min-w-full divide-y divide-gray-200'>
				<thead className='bg-gray-50'>
					<tr>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
							Created
						</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
							Tutor
						</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
							Status
						</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
							Title
						</th>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
							Link
						</th>
						<th className='relative px-6 py-3'>
							<span className='sr-only'>Actions</span>
						</th>
					</tr>
				</thead>
				<tbody className='bg-white divide-y divide-gray-200'>
					{Array.from({ length: count }, (_, index) => (
						<SessionTableRowSkeleton
							key={index}
							index={index}
						/>
					))}
				</tbody>
			</table>
		</motion.div>
	);
};

// Filters Skeleton
const SessionFiltersSkeleton: React.FC = () => {
	return (
		<div className='bg-white rounded-xl border p-4 mb-6 shadow-sm'>
			<div className='flex flex-wrap gap-4 items-center justify-between'>
				{/* Search */}
				<div className='relative flex-1 max-w-md'>
					<Skeleton className='h-10 w-full rounded-lg' />
				</div>

				<div className='flex gap-3 items-center'>
					{/* Filter Button */}
					<Skeleton className='h-10 w-20 rounded-lg' />

					{/* View Toggle */}
					<Skeleton className='h-10 w-16 rounded-lg' />

					{/* Export Button */}
					<Skeleton className='h-10 w-20 rounded-lg' />
				</div>
			</div>
		</div>
	);
};

// Pagination Skeleton
const SessionPaginationSkeleton: React.FC = () => {
	return (
		<div className='bg-white rounded-lg border border-gray-200 shadow-sm mt-6 px-6 py-3 flex items-center justify-between'>
			<Skeleton className='h-4 w-48' />
			<div className='flex items-center gap-2'>
				<Skeleton className='h-9 w-20 rounded-md' />
				<Skeleton className='h-9 w-24 rounded-md' />
				<Skeleton className='h-9 w-16 rounded-md' />
			</div>
		</div>
	);
};

// Main Session Table Skeleton Component
const SessionTableSkeleton: React.FC<{
	viewMode?: "grid" | "list";
	itemCount?: number;
}> = ({ viewMode = "list", itemCount = 4 }) => {
	return (
		<div>
			{/* Filters Skeleton */}
			<SessionFiltersSkeleton />

			{/* Content Skeleton */}
			{viewMode === "grid" ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}>
					<SessionGridSkeleton count={itemCount} />
				</motion.div>
			) : (
				<SessionHeadSkeleton count={itemCount} />
			)}

			{/* Pagination Skeleton */}
			<SessionPaginationSkeleton />
		</div>
	);
};

// Export all components
export {
	SessionTableSkeleton as default,
	SessionGridSkeleton,
	SessionTableSkeleton as SessionListSkeleton,
	SessionFiltersSkeleton,
	SessionPaginationSkeleton,
	SessionCardSkeleton,
	SessionTableRowSkeleton,
};
