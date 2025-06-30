import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SessionMetricsSkeleton = () => {
	return (
		<Card className='rounded-xl border border-gray-200 bg-white'>
			<CardHeader className='flex flex-row justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium text-gray-700'>
					<Skeleton className='h-4 w-24' />
				</CardTitle>
				<div className='w-9 h-9 p-2 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200'>
					<Skeleton className='h-5 w-5' />
				</div>
			</CardHeader>
			<CardContent className='pt-0'>
				<div className='text-2xl font-bold text-gray-700 mb-2'>
					<Skeleton className='h-8 w-16' />
				</div>
				<p className='text-xs text-gray-400 font-medium'>
					<Skeleton className='h-3 w-32' />
				</p>
			</CardContent>
		</Card>
	);
};

export default SessionMetricsSkeleton;
