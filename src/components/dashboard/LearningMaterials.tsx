import { useState, useRef } from "react";
import {
	Upload,
	FileText,
	Globe,
	Link as LinkIcon,
	Plus,
	X,
	Image,
	File,
} from "lucide-react";
import showToast from "@/utils/toast.utils";

// Type definitions
export interface FileItem {
	id: string;
	file: File;
	name: string;
	size: number;
	type: string;
}

export interface UrlItem {
	id: string;
	url: string;
	title: string;
}

export interface LearningMaterials {
	files: FileItem[];
	urls: UrlItem[];
	textContent: string;
}

export interface LearningMaterialsProps {
	materials: LearningMaterials;
	setMaterials: React.Dispatch<React.SetStateAction<LearningMaterials>>;
}

const LearningMaterialsComponent: React.FC<LearningMaterialsProps> = ({
	materials,
	setMaterials,
}) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const [newUrl, setNewUrl] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addUrl = () => {
		if (!newUrl.trim()) return;

		// Basic URL validation
		try {
			new URL(newUrl);
		} catch {
			showToast.error("Please enter a valid URL");
			return;
		}

		setMaterials((prev) => ({
			...prev,
			urls: [
				...prev.urls,
				{
					id: Math.random().toString(36).substr(2, 9),
					url: newUrl,
					title: newUrl,
				},
			],
		}));
		setNewUrl("");
	};

	const removeMaterial = (type: "files" | "urls", id: string) => {
		setMaterials((prev) => ({
			...prev,
			[type]: prev[type].filter((item) => item.id !== id),
		}));
	};

	const getFileIcon = (fileType: string) => {
		if (fileType.startsWith("image/"))
			return <Image className='w-8 h-8 text-amber-500' />;
		if (fileType.includes("pdf"))
			return <File className='w-8 h-8 text-pink-400' />;
		if (fileType.includes("word"))
			return <File className='w-8 h-8 text-blue-400' />;
		return <FileText className='w-8 h-8 text-purple-400' />;
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const handleFileUpload = (files: FileList | null) => {
		if (!files) return;

		// Only allow one file
		if (materials.files.length > 0) {
			showToast.error(
				"You can only upload one file. Please remove the existing file first."
			);
			return;
		}

		// Take only the first file from the selection
		const file = files[0];
		if (!file) return;

		const maxSize = 3 * 1024 * 1024; // 3MB
		const allowedTypes = [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"text/plain",
			"image/jpeg",
			"image/png",
			"image/gif",
		];

		if (file.size > maxSize) {
			showToast.error(`${file.name} is too large. Max size is 3MB.`);
			return;
		}

		if (!allowedTypes.includes(file.type)) {
			showToast.error(`${file.name} is not a supported file type.`);
			return;
		}

		setMaterials((prev) => ({
			...prev,
			files: [
				{
					id: Math.random().toString(36).substr(2, 9),
					file,
					name: file.name,
					size: file.size,
					type: file.type,
				},
			],
		}));
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(false);
		const files = e.dataTransfer.files;
		handleFileUpload(files);
	};

	return (
		<div className='bg-white p-6 rounded-2xl border shadow-sm'>
			<div className='flex items-center gap-2 mb-4'>
				<h3 className='text-lg font-semibold text-gray-800'>
					Learning Materials
				</h3>
				<FileText className='w-4 h-4 text-gray-400' />
			</div>
			<p className='text-sm text-gray-600 mb-6'>
				Upload a file or paste content to help your tutor understand what
				you're working with
			</p>

			<div className='space-y-6'>
				{/* File Upload */}
				<div>
					<h4 className='font-medium text-gray-700 mb-3 flex items-center gap-2'>
						<Upload className='w-4 h-4' />
						Upload File {materials.files.length > 0 && "(1/1)"}
					</h4>
					<div
						className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
							materials.files.length > 0
								? "border-gray-200 bg-gray-50 opacity-50 pointer-events-none"
								: isDragOver
								? "border-blue-500 bg-blue-50"
								: "border-gray-300 hover:border-gray-400"
						}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={() =>
							materials.files.length === 0 &&
							fileInputRef.current?.click()
						}>
						<Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
						<p className='text-gray-600 mb-1'>
							{materials.files.length > 0
								? "File uploaded (remove to upload another)"
								: "Drop file here or click to browse"}
						</p>
						<p className='text-xs text-gray-500'>
							PDF, DOC, TXT, Images (Max 3MB)
						</p>
						<input
							ref={fileInputRef}
							type='file'
							className='hidden'
							onChange={(e) => handleFileUpload(e.target.files)}
							accept='.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif'
						/>
					</div>
				</div>

				{/* URL Input - Hidden */}
				<div className='hidden'>
					<h4 className='font-medium text-gray-700 mb-3 flex items-center gap-2'>
						<LinkIcon className='w-4 h-4' />
						Add Links
					</h4>
					<div className='flex gap-2'>
						<input
							type='url'
							value={newUrl}
							onChange={(e) => setNewUrl(e.target.value)}
							placeholder='https://example.com/article'
							className='flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
							onKeyPress={(e) => e.key === "Enter" && addUrl()}
						/>
						<button
							type='button'
							onClick={addUrl}
							className='px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
							<Plus className='w-4 h-4' />
						</button>
					</div>
				</div>

				{/* Text Content */}
				<div>
					<h4 className='font-medium text-gray-700 mb-3 flex items-center gap-2'>
						<FileText className='w-4 h-4' />
						Learning Context
					</h4>
					<textarea
						value={materials.textContent}
						onChange={(e) =>
							setMaterials((prev) => ({
								...prev,
								textContent: e.target.value,
							}))
						}
						placeholder='Paste text, notes, or any content you want your tutor to reference...'
						rows={4}
						className='w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
					/>
				</div>

				{/* Materials List */}
				{(materials.files.length > 0 || materials.urls.length > 0) && (
					<div className='space-y-3'>
						<h4 className='font-medium text-gray-700'>Added Materials</h4>

						{/* Files */}
						{materials.files.map((fileItem) => (
							<div
								key={fileItem.id}
								className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
								<div className='flex items-center gap-3'>
									{getFileIcon(fileItem.type)}
									<div>
										<p className='font-medium text-gray-800 text-sm'>
											{fileItem.name}
										</p>
										<p className='text-xs text-gray-500'>
											{formatFileSize(fileItem.size)}
										</p>
									</div>
								</div>
								<button
									type='button'
									onClick={() => removeMaterial("files", fileItem.id)}
									className='text-gray-400 bg-gray-200 hover:bg-red-100 hover:text-red-500 transition-colors rounded-full flex items-center justify-center p-1'>
									<X className='w-4 h-4' />
								</button>
							</div>
						))}

						{/* URLs - Hidden but keeping the functionality */}
						{materials.urls.map((urlItem) => (
							<div
								key={urlItem.id}
								className='hidden flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
								<div className='flex items-center gap-3'>
									<Globe className='w-4 h-4 text-green-500' />
									<div className='flex-1 min-w-0'>
										<p className='font-medium text-gray-800 text-sm truncate'>
											{urlItem.title}
										</p>
										<p className='text-xs text-gray-500 truncate'>
											{urlItem.url}
										</p>
									</div>
								</div>
								<button
									type='button'
									onClick={() => removeMaterial("urls", urlItem.id)}
									className='text-gray-400 hover:text-red-500 transition-colors'>
									<X className='w-4 h-4' />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default LearningMaterialsComponent;
