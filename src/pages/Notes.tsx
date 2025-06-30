import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Search } from "lucide-react";
import showToast from "@/utils/toast.utils";
import { Session, sessionService } from "@/services/session.service";
import { useProfileStore } from "@/hooks/dashboard/useProfileStore";
import NoteCard from "@/components/dashboard/NoteCard";
import { NoteCardSkeletonGrid } from "@/components/dashboard/NoteCardSkeleton";

const Notes: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const { profile } = useProfileStore();
	const [notes, setNotes] = useState<Session[]>([]);
	const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});

	// Filter notes based on search term
	const filteredNotes = useMemo(() => {
		if (!searchTerm.trim()) {
			return notes;
		}

		const searchLower = searchTerm.toLowerCase();
		return notes.filter((note) => {
			// Search in multiple fields - adjust these based on your Session object structure
			const searchFields = [
				note.title,
				// Add other searchable fields from your Session object
			];

			return searchFields.some((field) =>
				field?.toLowerCase().includes(searchLower)
			);
		});
	}, [notes, searchTerm]);

	// Load sessions and initialize bookmarks
	useEffect(() => {
		const getUserSession = async () => {
			if (!profile) {
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				const fetchedSessions = await sessionService.getSessionsByUserId(
					profile.id
				);
				setNotes(fetchedSessions);

				// Initialize bookmarks state from localStorage
				const initialBookmarks: Record<string, boolean> = {};
				fetchedSessions.forEach((session) => {
					initialBookmarks[session.id!] =
						localStorage.getItem(`bookmark-${session.id}`) === "true";
				});
				setBookmarks(initialBookmarks);
			} catch (error) {
				console.error("Error fetching sessions:", error);
				showToast.error("Failed to load sessions");
			} finally {
				setIsLoading(false);
			}
		};

		getUserSession();
	}, [profile]);

	// Function to toggle bookmark state
	const toggleBookmark = (id: string) => {
		setBookmarks((prev) => {
			const newBookmarks = { ...prev };
			newBookmarks[id] = !prev[id];

			// Update localStorage
			if (newBookmarks[id]) {
				localStorage.setItem(`bookmark-${id}`, "true");
			} else {
				localStorage.removeItem(`bookmark-${id}`);
			}

			return newBookmarks;
		});
	};

	// Handle search input change
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	// Clear search
	const clearSearch = () => {
		setSearchTerm("");
	};

	return (
		<motion.div
			className='max-w-7xl mx-auto p-6 pt-10'
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}>
			{/* Header */}
			<motion.div
				className='flex justify-between items-center mb-8'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}>
				<div>
					<h1 className='text-3xl font-marlin font-bold text-gray-700 mb-2 flex items-center gap-3'>
						<FileText className='w-8 h-8 text-blue-500' />
						Session Notes
					</h1>
					<p className='text-gray-600'>
						Access and download detailed study notes from your tutoring
						sessions with Nora AI
					</p>
				</div>
			</motion.div>

			<div className='bg-white rounded-xl border p-4 mb-6 shadow-sm'>
				<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
					{/* Search */}
					<div className='relative flex-1 w-full'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
						<input
							type='text'
							placeholder='Search notes...'
							value={searchTerm}
							onChange={handleSearchChange}
							className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>
						{searchTerm && (
							<button
								onClick={clearSearch}
								className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium'
								type='button'>
								Clear
							</button>
						)}
					</div>
					{searchTerm && (
						<div className='text-sm text-gray-500'>
							{filteredNotes.length} of {notes.length} notes
						</div>
					)}
				</div>
			</div>

			{/* Content Area */}
			{isLoading ? (
				// Show skeleton loading state
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}>
					<NoteCardSkeletonGrid count={8} />
				</motion.div>
			) : filteredNotes.length > 0 ? (
				// Show filtered notes
				<motion.div
					initial={{ opacity: 0, y: 25 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{filteredNotes.map((item, index) => {
						const backgrounds = ["bg-blue-50"];
						const bg = backgrounds[index % backgrounds.length];
						return (
							<NoteCard
								key={item.id}
								{...(item as Required<Session>)}
								bg={bg}
								isBookmarked={bookmarks[item.id!] || false}
								onToggleBookmark={toggleBookmark}
							/>
						);
					})}
				</motion.div>
			) : searchTerm ? (
				// Show no search results state
				<div className='flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-gray-200'>
					<Search className='w-16 h-16 text-gray-300 mb-4' />
					<h3 className='text-lg font-medium text-gray-700 mb-2'>
						No notes found
					</h3>
					<p className='text-gray-500 max-w-md mb-4'>
						No notes match your search for "{searchTerm}". Try different
						keywords or check your spelling.
					</p>
					<button
						onClick={clearSearch}
						className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
						Clear search
					</button>
				</div>
			) : (
				// Show empty state (no notes at all)
				<div className='flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-gray-200'>
					<FileText className='w-16 h-16 text-gray-300 mb-4' />
					<h3 className='text-lg font-medium text-gray-700 mb-2'>
						No notes yet
					</h3>
					<p className='text-gray-500 max-w-md'>
						Complete a tutoring session with Nora AI to generate study
						notes that will appear here.
					</p>
				</div>
			)}
		</motion.div>
	);
};

export default Notes;
