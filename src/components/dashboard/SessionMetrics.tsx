import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type SessionMetricsProps = {
	title: string;
	icon: ReactNode;
	value: number | string;
	displayValue?: string; // Optional: for formatted display (e.g., "2h 30m" instead of 150)
	growth?: string; // Optional: growth percentage (e.g., "+15.2%")
};

function SessionMetrics(props: SessionMetricsProps) {
	const { title, icon, value, displayValue, growth } = props;

	return (
		<Card className='rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all duration-200 hover:border-gray-300'>
			<CardHeader className='flex flex-row justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium text-gray-700'>
					{title}
				</CardTitle>
				<div className='w-9 h-9 p-2 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 border border-blue-200'>
					{icon}
				</div>
			</CardHeader>
			<CardContent className='pt-0'>
				<div className='text-2xl font-bold text-gray-700 mb-2'>
					{displayValue || value}
				</div>
				<p className='text-xs text-gray-400 font-medium'>
					{growth ? `${growth} from last month` : "+0% from last month"}
				</p>
			</CardContent>
		</Card>
	);
}

export default SessionMetrics;
