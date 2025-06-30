import { FileText, File, Globe } from "lucide-react";
import { LearningMaterials } from "./LearningMaterials";

interface LearningMaterialsSummaryProps {
	materials: LearningMaterials;
	className?: string;
	variant?: "blue" | "gray" | "minimal";
}

const LearningMaterialsSummary: React.FC<LearningMaterialsSummaryProps> = ({
	materials,
	className = "",
	variant = "minimal",
}) => {
	// Return null if no materials
	if (
		!materials.files.length &&
		!materials.urls.length &&
		!materials.textContent.trim()
	) {
		return null;
	}

	// Style variants
	const styles = {
		blue: {
			container: "bg-blue-50 p-4 rounded-xl space-y-2",
			title: "font-semibold text-blue-800 text-sm",
			content: "space-y-1 text-xs text-blue-700",
			icon: "text-blue-600",
		},
		gray: {
			container: "bg-gray-50 p-4 rounded-xl space-y-2",
			title: "font-semibold text-gray-800 text-sm",
			content: "space-y-1 text-xs text-gray-600",
			icon: "text-gray-500",
		},
		minimal: {
			container: "py-2 space-y-1.5",
			title: "font-medium text-gray-700 text-sm",
			content: "flex flex-wrap gap-3 text-xs",
			icon: "text-gray-500",
		},
	};

	const currentStyle = styles[variant];

	// For minimal variant, use a horizontal layout
	if (variant === "minimal") {
		return (
			<div className={`${currentStyle.container} ${className}`}>
				<div className={`${currentStyle.title} flex items-center gap-1.5`}>
					<FileText className='w-3.5 h-3.5' />
					<span>Materials</span>
				</div>
				<div className={currentStyle.content}>
					{materials.files.length > 0 && (
						<div className='flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full'>
							<File className={`w-3 h-3 ${currentStyle.icon}`} />
							<span className='text-gray-700'>
								{materials.files.length}
							</span>
						</div>
					)}
					{materials.urls.length > 0 && (
						<div className='flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full'>
							<Globe className={`w-3 h-3 ${currentStyle.icon}`} />
							<span className='text-gray-700'>
								{materials.urls.length}
							</span>
						</div>
					)}
					{materials.textContent.trim() && (
						<div className='flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full'>
							<FileText className={`w-3 h-3 ${currentStyle.icon}`} />
							<span className='text-gray-700'>Text</span>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Standard vertical layout for blue/gray variants
	return (
		<div className={`${currentStyle.container} ${className}`}>
			<h5 className={`${currentStyle.title} flex items-center gap-2`}>
				<FileText className='w-4 h-4' />
				Learning Materials
			</h5>
			<div className={currentStyle.content}>
				{materials.files.length > 0 && (
					<div className='flex items-center gap-1'>
						<File className={`w-3 h-3 ${currentStyle.icon}`} />
						<span>
							{materials.files.length} file
							{materials.files.length > 1 ? "s" : ""}
						</span>
					</div>
				)}
				{materials.urls.length > 0 && (
					<div className='flex items-center gap-1'>
						<Globe className={`w-3 h-3 ${currentStyle.icon}`} />
						<span>
							{materials.urls.length} link
							{materials.urls.length > 1 ? "s" : ""}
						</span>
					</div>
				)}
				{materials.textContent.trim() && (
					<div className='flex items-center gap-1'>
						<FileText className={`w-3 h-3 ${currentStyle.icon}`} />
						<span>Text content added</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default LearningMaterialsSummary;
