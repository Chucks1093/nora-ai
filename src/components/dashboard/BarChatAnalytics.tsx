import { TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { useEffect, useState } from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { ChartLoadingSkeleton } from "./ChartLoadingSkeleton";
import {
	sessionService,
	SessionChartData,
	SessionSummaryData,
} from "@/services/session.service";

export const description = "A bar chart showing tutoring sessions per month";

const chartConfig = {
	sessions: {
		label: "Sessions",
		color: "hsl(217, 91%, 60%)",
	},
} satisfies ChartConfig;

type BarChartProps = {
	userId: string; // User ID to filter sessions
	year?: number; // Optional year, defaults to current year
	chartStyles?: string | undefined;
	cardStyles?: string;
	cardContentStyles?: string;
	cardHeaderStyles?: string;
};

export function TutoringSessionsChart(props: BarChartProps) {
	const { userId, year = new Date().getFullYear() } = props;

	const [chartData, setChartData] = useState<SessionChartData[]>([]);
	const [barChartData, setBarChartData] = useState<SessionChartData[]>([]);
	const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch sessions data using the service
	const fetchSessionsData = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Use the service method to get both chart data and summary
			const { chartData, summary } =
				await sessionService.getUserSessionsAnalytics(userId, year);

			setChartData(chartData);
			setSummaryData(summary);
		} catch (err) {
			console.error("Error fetching sessions data:", err);
			setError("Failed to load sessions data");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (userId) {
			fetchSessionsData();
		}
	}, [userId, year]);

	useEffect(() => {
		const handleResize = () => {
			// Get only the last 7 items from the data array for mobile
			const lastSevenMonths = chartData.slice(-7);
			setBarChartData(
				window.innerWidth >= 900 ? chartData : lastSevenMonths
			);
		};

		if (chartData.length > 0) {
			handleResize();
			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}
	}, [chartData]);

	// Show loading skeleton
	if (isLoading) {
		return (
			<ChartLoadingSkeleton
				cardStyles={props.cardStyles}
				cardContentStyles={props.cardContentStyles}
				cardHeaderStyles={props.cardHeaderStyles}
			/>
		);
	}

	// Show error state
	if (error) {
		return (
			<Card
				className={cn(
					"w-full bg-white border border-gray-200 rounded-xl",
					props.cardStyles
				)}>
				<CardContent className='flex items-center justify-center h-64'>
					<div className='text-center'>
						<p className='text-red-500 mb-2'>Error loading chart data</p>
						<button
							onClick={fetchSessionsData}
							className='text-blue-500 hover:text-blue-700 text-sm'>
							Try again
						</button>
					</div>
				</CardContent>
			</Card>
		);
	}

	const percentageChange = summaryData?.percentage_change || 0;
	const totalSessions = summaryData?.total_sessions || 0;
	const isPositiveChange = percentageChange >= 0;

	return (
		<Card
			className={cn(
				"w-full flex flex-col justify-between bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200",
				props.cardStyles
			)}>
			<CardHeader className={cn("pb-4", props.cardHeaderStyles)}>
				<CardTitle className='text-2xl font-manrope text-gray-600 font-semibold'>
					Sessions per Month
				</CardTitle>
				<CardDescription className='text-gray-400'>
					January - December {year}
				</CardDescription>
			</CardHeader>

			<CardContent className={cn("pb-4", props.cardContentStyles)}>
				<ChartContainer
					className={cn("h-[170px]", props.chartStyles)}
					config={chartConfig}>
					<BarChart
						accessibilityLayer
						data={barChartData}
						margin={{
							top: 20,
							left: 10,
							right: 10,
						}}>
						<CartesianGrid
							stroke='#e5e7eb'
							strokeDasharray='3 3'
							vertical={false}
						/>
						<XAxis
							dataKey='month'
							tickLine={false}
							tickMargin={8}
							axisLine={false}
							tick={{ fontSize: 12, fill: "#6b7280" }}
							tickFormatter={(value) => value.slice(0, 3)}
						/>
						<ChartTooltip
							cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
							content={
								<ChartTooltipContent
									hideLabel
									className='bg-white border border-gray-200 shadow-lg rounded-lg'
								/>
							}
						/>
						<Bar
							dataKey='sessions'
							fill='#5798FFFF'
							barSize={48}>
							<LabelList
								position='top'
								offset={8}
								className='fill-gray-700'
								fontSize={11}
								fontWeight={500}
							/>
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>

			<CardFooter className='flex-col items-start gap-2 text-sm pt-0 border-t border-gray-100'>
				<div className='flex gap-2 font-medium leading-none text-gray-900 mt-8'>
					<span
						className={
							isPositiveChange ? "text-green-600" : "text-red-600"
						}>
						{isPositiveChange ? "+" : ""}
						{percentageChange}%
					</span>
					{isPositiveChange ? "increase" : "decrease"} this month
					{isPositiveChange ? (
						<TrendingUp className='h-4 w-4 text-green-600' />
					) : (
						<TrendingDown className='h-4 w-4 text-red-600' />
					)}
				</div>
				<div className='leading-none text-gray-500'>
					{totalSessions} tutoring sessions completed this year
				</div>
			</CardFooter>
		</Card>
	);
}
