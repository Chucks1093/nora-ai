import React, { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Search, LogOut, ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/hooks/dashboard/useProfileStore";
import { authService } from "@/services/auth.service";
import { useNavigate } from "react-router";

interface HeaderProps {
	className?: string;
	onMenuClick?: () => void;
	showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
	className,
	onMenuClick,
	showMenuButton = false,
}) => {
	// Internal state
	const [searchQuery, setSearchQuery] = useState("");
	const { profile, clearProfile } = useProfileStore();
	const navigate = useNavigate();

	// Internal handlers
	const handleSearch = () => {
		if (searchQuery.trim()) {
			console.log("Searching for:", searchQuery);
			// Add your search logic here
		}
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const handleLogout = async () => {
		console.log("Logging out...");
		await authService.signOut();
		clearProfile();
		navigate("/");
	};

	const getInitials = (name: string) => {
		if (!name) return "";
		return name
			.split(" ")
			.map((part) => part.charAt(0))
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const image = profile?.avatar;

	return (
		profile && (
			<TooltipProvider>
				<header
					className={cn(
						"h-16 bg-white border-b border-gray-200  flex justify-center  ",
						className
					)}>
					<div className='flex items-center justify-between w-full h-full max-w-7xl px-4'>
						{/* Left Section - Mobile Menu + Search */}
						<div className='flex items-center gap-4 flex-1'>
							{/* Mobile Menu Button */}
							{showMenuButton && (
								<Button
									variant='ghost'
									size='sm'
									className='lg:hidden p-2'
									onClick={onMenuClick}>
									<Menu className='h-5 w-5' />
								</Button>
							)}

							{/* Logo - Hidden on mobile when search is active */}
							<div className='flex items-center gap-3 lg:hidden'>
								<div className='bg-blue-500 flex items-center justify-center p-2 rounded-full'>
									<img
										src='/icons/logo.png'
										alt='Nora AI Logo'
										className='h-4 w-4'
										onError={(e) => {
											e.currentTarget.style.display = "none";
											e.currentTarget.parentElement!.innerHTML =
												'<span class="text-white font-bold text-sm">N</span>';
										}}
									/>
								</div>
								<h2 className='font-semibold text-lg text-gray-900 font-montserrat hidden sm:block'>
									Nora AI
								</h2>
							</div>

							{/* Search */}
							<div className='flex-1 max-w-lg hidden md:block'>
								<div className='relative '>
									<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
									<Input
										type='text'
										placeholder='Search sessions, notes, or topics...'
										value={searchQuery}
										onChange={handleSearchChange}
										onKeyPress={handleKeyPress}
										className='pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 focus:bg-white transition-all focus-visible:ring-blue-500'
									/>
								</div>
							</div>
						</div>

						{/* Right Section - User */}
						<div className='flex items-center ml-4'>
							{/* User Dropdown */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='ghost'
										className='flex items-center gap-2 px-2 sm:px-3 py-2 h-auto bg-white border border-gray-200 rounded-full hover:border-gray-300 transition-all duration-200'>
										<Avatar className='w-8 h-8'>
											<AvatarImage
												src={image}
												alt={profile?.username}
											/>
											<AvatarFallback className='bg-blue-500 text-white text-sm'>
												{getInitials(profile?.username)}
											</AvatarFallback>
										</Avatar>
										<span className='text-sm font-medium text-gray-700 hidden sm:block'>
											{profile?.username.split(" ")[0]}
										</span>
										<ChevronDown className='w-4 h-4 text-gray-500 hidden sm:block' />
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align='end'
									className='w-64 bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-black/5 border-0 rounded-xl p-2'>
									{/* User Info Section with Centered Avatar */}
									<div className=' flex flex-col items-center py-4 px-2  bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-2'>
										<Avatar className='w-16 h-16 mb-3 ring-2 ring-white shadow-md'>
											<AvatarImage
												src={image}
												alt={profile.username}
											/>
											<AvatarFallback className='bg-blue-500 text-white text-lg font-semibold'>
												{getInitials(profile.username)}
											</AvatarFallback>
										</Avatar>
										<div className='text-center'>
											<p className='text-sm font-semibold text-gray-900 mb-1'>
												{profile.username}
											</p>
											<p className='text-xs text-gray-600'>
												{profile.email}
											</p>
										</div>
									</div>

									<DropdownMenuSeparator className='my-2' />

									<DropdownMenuItem
										className='cursor-pointer flex items-center px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-lg transition-colors'
										onClick={handleLogout}>
										<LogOut className='mr-3 h-4 w-4' />
										<span>Sign Out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</header>
			</TooltipProvider>
		)
	);
};

export default Header;
