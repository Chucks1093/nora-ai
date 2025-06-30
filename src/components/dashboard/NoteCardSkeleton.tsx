import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
// Single NoteCard Skeleton
export function NoteCardSkeleton() {
	return (
		<motion.article
			className='p-2 shadow-lg rounded-lg border bg-white border-gray-200'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}>
			{/* Header Section */}
			<div className='flex justify-between items-center rounded-t-lg p-4 bg-gray-50'>
				<Skeleton className='h-3 w-16' />
				<Skeleton className='h-6 w-6 rounded' />
			</div>

			{/* Title Section with pulsing effect */}
			<div className='h-[14rem] pt-2 px-4 bg-gray-50 flex flex-col gap-3'>
				<Skeleton className='h-8 w-full animate-pulse' />
				<Skeleton
					className='h-8 w-3/4 animate-pulse'
					style={{ animationDelay: "0.1s" }}
				/>
				<Skeleton
					className='h-8 w-1/2 animate-pulse'
					style={{ animationDelay: "0.2s" }}
				/>
			</div>

			{/* Footer Section */}
			<div className='flex justify-between items-center gap-3 pt-3 pb-1'>
				<Skeleton className='h-8 w-20 rounded-md' />
				<Skeleton className='h-6 w-10 rounded-lg' />
			</div>
		</motion.article>
	);
}

// Grid of Note Card Skeletons
interface NoteCardSkeletonGridProps {
	count?: number;
}

export function NoteCardSkeletonGrid({ count = 8 }: NoteCardSkeletonGridProps) {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
			{Array.from({ length: count }).map((_, index) => (
				<NoteCardSkeleton key={index} />
			))}
		</div>
	);
}
