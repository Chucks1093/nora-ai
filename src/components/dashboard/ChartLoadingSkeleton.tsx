import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartSkeletonProps = {
	cardStyles?: string;
	cardContentStyles?: string;
	cardHeaderStyles?: string;
};

export function ChartLoadingSkeleton(props: ChartSkeletonProps) {
	return (
		<Card
			className={cn(
				"w-full flex flex-col justify-between bg-white border border-gray-200 rounded-xl shadow-sm",
				props.cardStyles
			)}>
			<CardHeader className={cn("pb-4", props.cardHeaderStyles)}>
				{/* Title skeleton */}
				<div className='h-7 bg-gray-200 rounded-md w-48 animate-pulse mb-2' />
				{/* Description skeleton */}
				<div className='h-4 bg-gray-100 rounded w-32 animate-pulse' />
			</CardHeader>

			<CardContent className={cn("pb-4", props.cardContentStyles)}>
				{/* Chart area skeleton */}
				<div className='h-[170px] flex items-end justify-between px-4 py-4'>
					{/* Simulated bars */}
					{Array.from({ length: 12 }).map((_, index) => (
						<div
							key={index}
							className='flex flex-col items-center gap-2'>
							{/* Bar */}
							<div
								className='bg-gray-200 rounded-t animate-pulse w-6'
								style={{
									height: `${Math.random() * 80 + 20}px`,
									animationDelay: `${index * 100}ms`,
								}}
							/>
							{/* Month label */}
							<div className='h-3 bg-gray-100 rounded w-6 animate-pulse' />
						</div>
					))}
				</div>
			</CardContent>

			{/* Footer skeleton */}
			<div className='flex-col items-start gap-2 text-sm pt-0 border-t border-gray-100 px-6 pb-6'>
				<div className='flex gap-2 items-center mt-8 mb-2'>
					<div className='h-4 bg-gray-200 rounded w-24 animate-pulse' />
					<div className='h-4 w-4 bg-gray-200 rounded animate-pulse' />
				</div>
				<div className='h-4 bg-gray-100 rounded w-56 animate-pulse' />
			</div>
		</Card>
	);
}
