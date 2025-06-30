import {
	ChevronDown,
	Download,
	Filter,
	MoreHorizontal,
	LayoutGrid,
	List,
	ExternalLink,
	Search,
	User,
	Copy,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { formatDateTime } from "@/utils/date.utils";
import { SessionStatusBadge } from "./SessionStatusBadge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { sessionService } from "@/services/session.service";
import { useProfileStore } from "@/hooks/dashboard/useProfileStore";
import showToast from "@/utils/toast.utils";
// Import the skeleton components
import SessionTableSkeleton from "./SessionTableSkeletons";
import { Session } from "@/services/session.service";
import useIsMobile from "@/hooks/dashboard/useIsMobile";
import toast from "react-hot-toast";

const SessionLink: React.FC<{ link: string }> = ({ link }) => {
	if (!link) {
		return <span className='text-sm text-gray-400'>No link</span>;
	}

	return (
		<a
			href={link}
			target='_blank'
			rel='noopener noreferrer'
			className='text-sm text-blue-600 hover:text-blue-800 hover:underline flex gap-1 items-center'
			title='Open session link in new tab'>
			View
			<ExternalLink className='w-4' />
		</a>
	);
};

const SessionCard: React.FC<Required<Session> & { index: number }> = (
	props
) => {
	const created = formatDateTime(props.created_at);

	const handleCopyLink = () => {
		if (props.url) {
			navigator.clipboard.writeText(props.url);
			showToast.success("Link copied to clipboard!");
		}
	};

	const handleDownloadNote = async () => {
		try {
			showToast.loading("Generating Note");
			if (props.conversation_id) {
				await sessionService.downloadNote(props.conversation_id);
				showToast.success("Note downloaded successfully!");
			}
		} catch (error) {
			showToast.error("Failed to download Conversation Note");
			console.log(error);
		} finally {
			toast.remove();
		}
	};

	return (
		<motion.div
			key={props.id}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: props.index * 0.1 }}
			className='bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-zinc-100 hover:border-blue-200 group cursor-pointer'>
			{/* Session Header */}
			<div className='p-8 pb-3'>
				<div className='flex items-center gap-4 mb-6'>
					<div className='p-1 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-full transition-colors'>
						<img
							src={props.tutor_image}
							alt={`${props.tutor} avatar`}
							className='w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm'
							onError={(e) => {
								e.currentTarget.src = "/icons/avatar.svg";
							}}
						/>
					</div>
					<div className='flex-1'>
						<h3 className='text-lg font-semibold text-zinc-800'>
							{props.tutor}
						</h3>
						<p className='text-sm text-zinc-500'>
							{props.tutor_personality}
						</p>
					</div>
				</div>
				<h3 className='h-[4rem]  text-xl font-semibold font-marlin text-zinc-600 mb-1 group-hover:text-blue-600 transition-colors overflow-ellipsis'>
					{props.title}
				</h3>
				<p className='text-zinc-400 leading-relaxed md:text-[1rem] text-sm  h-[3.6rem] '>
					{props.description ||
						"No description available for this session."}
				</p>
			</div>

			{/* Session Details */}
			<div className='px-8 py-6 bg-zinc-50 border-t border-zinc-100'>
				<div className='flex flex-wrap gap-2 mb-6'>
					<span className='px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-[.78rem] md:text-sm font-medium text-zinc-600 flex items-center gap-2'>
						{/* <Calendar className='h-4 w-4' /> */}
						{created.date}
					</span>
					<span className='px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-[.78rem] md:text-sm font-medium text-zinc-600 flex items-center gap-2'>
						{/* <Clock className='h-4 w-4' /> */}
						{created.time}
					</span>
				</div>
				<div className='flex justify-between items-center'>
					<div className='flex gap-3'>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={(e) => {
								e.stopPropagation();
								handleCopyLink();
							}}
							disabled={!props.url}
							className='p-2.5 bg-white border border-zinc-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
							<Copy className='h-5 w-5 text-zinc-600 hover:text-blue-600' />
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={(e) => {
								e.stopPropagation();
								handleDownloadNote();
							}}
							disabled={!props.notes}
							className='p-2.5 bg-white border border-zinc-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
							<Download className='h-5 w-5 text-zinc-600 hover:text-blue-600' />
						</motion.button>
					</div>
					<div className='flex items-center'>
						<SessionStatusBadge status={props.status} />
					</div>
				</div>
			</div>
		</motion.div>
	);
};
const SessionGrid: React.FC<{ sessions: Session[] }> = ({ sessions }) => {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{sessions.map((session, index) => (
				<SessionCard
					key={session.id}
					{...(session as Required<Session>)}
					index={index}
				/>
			))}
		</div>
	);
};

const SessionTableRow: React.FC<Required<Session>> = (props) => {
	const created = formatDateTime(props.created_at);

	const handleCopyLink = () => {
		if (props.url) {
			navigator.clipboard.writeText(props.url);
			showToast.success("Link copied to clipboard!");
		}
	};

	const handleDownloadNote = async () => {
		try {
			showToast.loading("Generating Note...");
			if (props.conversation_id) {
				await sessionService.downloadNote(props.conversation_id);
				showToast.success("Note downloaded successfully!");
			}
		} catch (error) {
			showToast.error("Failed to download Conversation Note");
			console.log(error);
		} finally {
			toast.remove();
		}
	};

	return (
		<tr className='bg-white hover:bg-gray-50 border-b border-gray-200 transition-colors'>
			{/* Date/Time */}
			<td className='px-6 py-4'>
				<p className='text-sm font-medium text-gray-900 mb-1'>
					{created.date}
				</p>
				<p className='text-xs text-gray-500'>{created.time}</p>
			</td>

			{/* Tutor Info */}
			<td className='px-6 py-4'>
				<div className='flex items-center gap-3'>
					<img
						src={props.tutor_image}
						alt={`${props.tutor} avatar`}
						className='w-14 h-14 rounded-full object-cover border-4 border-gray-200 '
						onError={(e) => {
							e.currentTarget.src = "/images/default-avatar.jpg";
						}}
					/>
					<div>
						<p className='text-sm font-medium text-gray-900 mb-1'>
							{props.tutor}
						</p>
						<p className='text-xs text-gray-500'>
							{props.tutor_personality}
						</p>
					</div>
				</div>
			</td>

			{/* Status */}
			<td className='px-6 py-4'>
				<SessionStatusBadge status={props.status} />
			</td>

			{/* Session Title */}
			<td className='px-6 py-4'>
				<p className='text-sm font-medium text-gray-900'>{props.title}</p>
			</td>

			{/* Session Link */}
			<td className='px-6 py-4'>
				<SessionLink link={props.url} />
			</td>

			{/* Actions */}
			<td className='px-6 py-4'>
				<div className='flex justify-end'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								className='p-2 hover:bg-gray-100 rounded-full transition-colors'
								title='More options'>
								<MoreHorizontal className='w-4 h-4 text-gray-400' />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align='end'
							className='w-48 bg-white shadow-lg ring-1 ring-black ring-opacity-5 border-0'>
							<DropdownMenuItem
								onClick={handleDownloadNote}
								disabled={!props.notes}
								className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>
								<Download className='w-4 h-4 mr-3' />
								Download Note
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={handleCopyLink}
								disabled={!props.url}
								className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>
								<ExternalLink className='w-4 h-4 mr-3' />
								Copy Link
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</td>
		</tr>
	);
};

const SessionTableFilters: React.FC<{
	filterStatus: string;
	onFilterChange: (status: string) => void;
	searchTerm: string;
	onSearchChange: (term: string) => void;
	viewMode: "grid" | "list";
	onViewModeChange: (mode: "grid" | "list") => void;
}> = ({
	filterStatus,
	onFilterChange,
	searchTerm,
	onSearchChange,
	viewMode,
	onViewModeChange,
}) => {
	const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
	const isMobile = useIsMobile();

	// Force grid view on mobile
	useEffect(() => {
		if (isMobile && viewMode === "list") {
			onViewModeChange("grid");
		}
	}, [isMobile, viewMode, onViewModeChange]);

	return (
		<div className='bg-white rounded-xl border p-4 mb-6 shadow-sm'>
			<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
				{/* Search */}
				<div className='relative flex-1 w-full sm:max-w-md'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
					<input
						type='text'
						placeholder='Search sessions...'
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
						className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
					/>
				</div>

				<div className='flex gap-3 items-center w-full sm:w-auto justify-between sm:justify-end'>
					{/* Filter */}
					<div className='relative'>
						<button
							type='button'
							className='inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'
							onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}>
							<Filter className='w-4 h-4 mr-2 text-gray-500' />
							Filter
							<ChevronDown
								className={`w-4 h-4 ml-2 text-gray-500 transition-transform ${
									isFilterMenuOpen ? "rotate-180" : ""
								}`}
							/>
						</button>

						{isFilterMenuOpen && (
							<div className='absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 border'>
								<div className='px-3 py-2 text-xs font-medium text-gray-500 uppercase border-b'>
									Status
								</div>
								{[
									"all",
									"completed",
									"in_progress",
									"cancelled",
									"missed",
								].map((status) => (
									<button
										key={status}
										className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
											filterStatus === status
												? "bg-blue-50 text-blue-600"
												: "text-gray-700"
										}`}
										onClick={() => {
											onFilterChange(status);
											setIsFilterMenuOpen(false);
										}}>
										{status === "all"
											? "All Sessions"
											: status
													.replace("_", " ")
													.replace(/\b\w/g, (l) =>
														l.toUpperCase()
													)}
									</button>
								))}
							</div>
						)}
					</div>

					{/* View Toggle - Hidden on mobile */}
					<div className='hidden md:flex items-center bg-gray-50 rounded-lg p-1 border'>
						<button
							type='button'
							className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
								viewMode === "list"
									? "bg-white text-gray-900 shadow-sm"
									: "text-gray-500 hover:text-gray-700"
							}`}
							onClick={() => onViewModeChange("list")}>
							<List className='w-4 h-4' />
						</button>
						<button
							type='button'
							className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
								viewMode === "grid"
									? "bg-white text-gray-900 shadow-sm"
									: "text-gray-500 hover:text-gray-700"
							}`}
							onClick={() => onViewModeChange("grid")}>
							<LayoutGrid className='w-4 h-4' />
						</button>
					</div>

					{/* Export - Hidden on mobile, show only icon on small screens */}
					<button
						type='button'
						className='inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'>
						<Download className='w-4 h-4 sm:mr-2 text-gray-500' />
						<span className='hidden sm:inline'>Export</span>
					</button>
				</div>
			</div>

			{/* Active Filters */}
			{(searchTerm || filterStatus !== "all") && (
				<div className='flex flex-wrap items-center gap-2 mt-3 pt-3 border-t'>
					<span className='text-sm text-gray-500'>Active filters:</span>
					{searchTerm && (
						<span className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800'>
							Search: {searchTerm}
						</span>
					)}
					{filterStatus !== "all" && (
						<span className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800'>
							Status: {filterStatus.replace("_", " ")}
						</span>
					)}
					<button
						type='button'
						className='text-xs text-gray-500 hover:text-gray-700 underline'
						onClick={() => {
							onSearchChange("");
							onFilterChange("all");
						}}>
						Clear all
					</button>
				</div>
			)}
		</div>
	);
};

// Updated SessionTable component with mobile-first approach
function ScheduledSessionTable() {
	const [currentPage, setCurrentPage] = useState(1);
	const { profile } = useProfileStore();
	const [itemsPerPage] = useState(4);
	const [filterStatus, setFilterStatus] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Default to grid for mobile-first
	const isMobile = useIsMobile();

	// Loading and data states
	const [isLoading, setIsLoading] = useState(true);
	const [sessions, setSessions] = useState<Session[]>([]);

	// Force grid view on mobile
	useEffect(() => {
		if (isMobile && viewMode === "list") {
			setViewMode("grid");
		}
	}, [isMobile]);

	useEffect(() => {
		const getUserSession = async () => {
			if (!profile) {
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				const fetchedSessions = await sessionService.getScheduledSessions(
					profile.id
				);
				setSessions(fetchedSessions);
			} catch (error) {
				console.error("Error fetching sessions:", error);
				showToast.error("Failed to load sessions");
			} finally {
				setIsLoading(false);
			}
		};

		getUserSession();
	}, []);

	// Filter sessions based on status and search term
	const filteredSessions = sessions.filter((session) => {
		const matchesStatus =
			filterStatus === "all" ||
			session.status.toLowerCase() === filterStatus.toLowerCase();
		const matchesSearch =
			searchTerm === "" ||
			session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			session.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
			session.description?.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesStatus && matchesSearch;
	});

	// Calculate pagination
	const totalItems = filteredSessions.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
	const currentSessions = filteredSessions.slice(startIndex, endIndex);

	const goToPreviousPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	const goToNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	};

	const handleFilterChange = (newFilter: string) => {
		setFilterStatus(newFilter);
		setCurrentPage(1);
	};

	const handleSearchChange = (newSearch: string) => {
		setSearchTerm(newSearch);
		setCurrentPage(1);
	};

	const handleViewModeChange = (mode: "grid" | "list") => {
		// Prevent switching to list view on mobile
		if (isMobile && mode === "list") {
			return;
		}
		setViewMode(mode);
		setCurrentPage(1);
	};

	// Show loading skeleton
	if (isLoading) {
		return (
			<SessionTableSkeleton
				viewMode={isMobile ? "grid" : viewMode}
				itemCount={itemsPerPage}
			/>
		);
	}

	// Force grid view on mobile for rendering
	const effectiveViewMode = isMobile ? "grid" : viewMode;

	return (
		<div>
			<SessionTableFilters
				filterStatus={filterStatus}
				onFilterChange={handleFilterChange}
				searchTerm={searchTerm}
				onSearchChange={handleSearchChange}
				viewMode={effectiveViewMode}
				onViewModeChange={handleViewModeChange}
			/>

			{currentSessions.length === 0 ? (
				<div className='bg-white rounded-lg border border-gray-200 shadow-sm p-8 sm:p-12 text-center'>
					<div className='w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
						<User className='w-6 h-6 sm:w-8 sm:h-8 text-gray-400' />
					</div>
					<h3 className='text-base sm:text-lg font-medium text-gray-900 mb-2'>
						No sessions found
					</h3>
					<p className='text-sm sm:text-base text-gray-500 mb-4'>
						{searchTerm || filterStatus !== "all"
							? "Try adjusting your search or filters to find what you're looking for."
							: "You haven't had any tutoring sessions yet. Start learning today!"}
					</p>
				</div>
			) : (
				<>
					{effectiveViewMode === "grid" ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}>
							<SessionGrid sessions={currentSessions} />
						</motion.div>
					) : (
						<motion.div
							className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}>
							<div className='overflow-x-auto'>
								<table className='min-w-full divide-y divide-gray-200'>
									<thead className='bg-gray-50'>
										<tr>
											<th
												scope='col'
												className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Created
											</th>
											<th
												scope='col'
												className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Tutor
											</th>
											<th
												scope='col'
												className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Status
											</th>
											<th
												scope='col'
												className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Title
											</th>
											<th
												scope='col'
												className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Link
											</th>
											<th
												scope='col'
												className='relative px-6 py-3'>
												<span className='sr-only'>Actions</span>
											</th>
										</tr>
									</thead>
									<tbody className='bg-white divide-y divide-gray-200'>
										{currentSessions.map((session) => (
											<SessionTableRow
												key={session.id}
												{...(session as Required<Session>)}
											/>
										))}
									</tbody>
								</table>
							</div>
						</motion.div>
					)}

					{/* Pagination - Mobile optimized */}
					<div className='bg-white rounded-lg border border-gray-200 shadow-sm mt-6 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0'>
						<div className='text-xs sm:text-sm text-gray-700 text-center sm:text-left'>
							Showing{" "}
							<span className='font-medium'>{startIndex + 1}</span> to{" "}
							<span className='font-medium'>{endIndex}</span> of{" "}
							<span className='font-medium'>{totalItems}</span>{" "}
							session(s)
						</div>
						<div className='flex items-center gap-2'>
							<button
								onClick={goToPreviousPage}
								disabled={currentPage === 1}
								className={`px-3 sm:px-4 py-2 border border-gray-200 rounded-md text-xs sm:text-sm transition-colors ${
									currentPage === 1
										? "text-gray-400 bg-gray-50 cursor-not-allowed"
										: "text-gray-700 bg-white hover:bg-gray-50"
								}`}>
								Previous
							</button>
							<span className='px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-700'>
								Page {currentPage} of {totalPages}
							</span>
							<button
								onClick={goToNextPage}
								disabled={
									currentPage === totalPages || totalPages === 0
								}
								className={`px-3 sm:px-4 py-2 border border-gray-200 rounded-md text-xs sm:text-sm transition-colors ${
									currentPage === totalPages || totalPages === 0
										? "text-gray-400 bg-gray-50 cursor-not-allowed"
										: "text-gray-700 bg-white hover:bg-gray-50"
								}`}>
								Next
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export default ScheduledSessionTable;
