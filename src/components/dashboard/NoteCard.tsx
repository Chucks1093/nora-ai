import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have this utility
import { memo, useState } from "react";
import { formatDateTime } from "@/utils/date.utils";
import { Session, sessionService } from "@/services/session.service";
import showToast from "@/utils/toast.utils";
import toast from "react-hot-toast";

// Add these props to your Session type
interface NoteCardProps extends Required<Session> {
	bg: string;
	isBookmarked: boolean;
	onToggleBookmark: (id: string) => void;
}

// Use React.memo to prevent unnecessary re-renders
const NoteCard = memo(function NoteCard(props: NoteCardProps) {
	const dateTime = formatDateTime(props.created_at);
	const [generating, setIsGenerating] = useState(false);

	const handleDownloadNote = async () => {
		try {
			showToast.loading("Generating Note");
			if (props.conversation_id) {
				setIsGenerating(true);
				await sessionService.downloadNote(props.conversation_id);
				showToast.success("Note downloaded successfully!");
			}
		} catch (error) {
			showToast.error("Failed to download Conversation Note");
			console.log(error);
		} finally {
			setIsGenerating(false);
			toast.remove();
		}
	};

	const handleBookmarkClick = (e: React.MouseEvent) => {
		if (!props.id) return;
		e.stopPropagation();
		props.onToggleBookmark(props.id);
	};

	return (
		<article className='p-2 shadow-lg rounded-lg border bg-white border-gray-200 hover:shadow-xl transition-shadow duration-200'>
			<div
				className={cn(
					"flex justify-between items-center rounded-t-lg p-4 bg-blue-100 noice",
					props.bg
				)}>
				<p className='text-[.8rem] text-gray-600'>{dateTime.date}</p>
				<div
					className='cursor-pointer'
					onClick={handleBookmarkClick}>
					{props.isBookmarked ? (
						<Bookmark className='text-gray-400 w-6 fill-gray-400 cursor-pointer' />
					) : (
						<Bookmark className='text-gray-400 w-6 cursor-pointer' />
					)}
				</div>
			</div>
			<h1
				className={cn(
					"h-[14rem] pt-2 font-manrope px-4 text-[1.7rem] bg-blue-100 noice text-gray-500",
					props.bg
				)}>
				{props.title}
			</h1>

			<div className='flex justify-between items-center gap-3 pt-3 pb-1'>
				<button
					className='bg-gray-600 hover:bg-gray-700 text-sm text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-1'
					onClick={handleDownloadNote}
					disabled={generating}>
					<img
						src='/icons/download.svg'
						alt=''
						className='w-5 text-gray-600 invert'
					/>
					Download
				</button>
				<p className='px-3 py-1 bg-gray-30 text-[.7rem] rounded-lg text-gray-700 border border-gray-300'>
					PDF
				</p>
			</div>
		</article>
	);
});

export default NoteCard;
