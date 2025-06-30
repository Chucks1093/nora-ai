import React from "react";
import {
	CheckCircle,
	XCircle,
	Clock,
	AlertTriangle,
	Calendar,
} from "lucide-react";

export type SessionStatus =
	| "COMPLETED"
	| "IN_PROGRESS"
	| "ENDED"
	| "SCHEDULED"
	| "MISSED";

interface StatusBadgeProps {
	status: SessionStatus;
}

export const SessionStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
	const getStatusConfig = (status: SessionStatus) => {
		switch (status) {
			case "COMPLETED":
				return {
					icon: CheckCircle,
					bgColor: "bg-green-100",
					textColor: "text-green-600",
				};
			case "IN_PROGRESS":
				return {
					icon: Clock,
					bgColor: "bg-blue-100",
					textColor: "text-blue-600",
				};
			case "SCHEDULED":
				return {
					icon: Calendar,
					bgColor: "bg-yellow-100",
					textColor: "text-yellow-600",
				};
			case "ENDED":
				return {
					icon: XCircle,
					bgColor: "bg-red-100",
					textColor: "text-red-600",
				};
			case "MISSED":
				return {
					icon: AlertTriangle,
					bgColor: "bg-orange-100",
					textColor: "text-orange-600",
				};
			default:
				return {
					icon: Clock,
					bgColor: "bg-gray-100",
					textColor: "text-gray-600",
				};
		}
	};

	const { icon: StatusIcon, bgColor, textColor } = getStatusConfig(status);

	return (
		<div
			className={`inline-flex items-center px-2 py-1 rounded-full ${bgColor} ${textColor}`}>
			<StatusIcon className='h-3.5 w-3.5 mr-1' />
			<span className='text-xs font-medium'>{status.replace("_", " ")}</span>
		</div>
	);
};
