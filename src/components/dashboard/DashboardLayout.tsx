import { useProfileStore } from "@/hooks/dashboard/useProfileStore";
import Header from "./Header";
import SideBar from "./SideBar";
import { Outlet, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import BoltBadge from "../common/BoltBadge";

function DashboardLayout() {
	const loaderData = useLoaderData();
	const { profile, setProfile } = useProfileStore();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	useEffect(() => {
		console.log("User", loaderData.user);
		if (loaderData.user) {
			setProfile(loaderData.user);
		}
	}, []);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	const closeSidebar = () => {
		setIsSidebarOpen(false);
	};

	return (
		profile && (
			<>
				{/* Mobile Layout */}
				<BoltBadge />
				<div className='lg:hidden min-h-screen bg-gray-50'>
					{/* Mobile overlay */}
					{isSidebarOpen && (
						<div
							className='fixed inset-0 bg-black bg-opacity-50 z-40'
							onClick={closeSidebar}
						/>
					)}

					{/* Mobile Sidebar */}
					<SideBar
						className={`
						fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out
						${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
					`}
						onNavigate={closeSidebar}
					/>

					{/* Mobile Content */}
					<div className='min-h-screen flex flex-col'>
						<Header
							className='sticky top-0 z-30'
							onMenuClick={toggleSidebar}
							showMenuButton={true}
						/>
						<main className='flex-1 bg-[#f8fafe] overflow-auto'>
							<Outlet />
						</main>
					</div>
				</div>

				{/* Desktop Layout */}
				<div className='hidden lg:block min-h-screen'>
					<div className='min-h-screen grid grid-cols-[256px_1fr] grid-rows-[auto_1fr] h-screen'>
						{/* Desktop Sidebar - spans full height */}
						<SideBar className='row-span-2' />

						{/* Desktop Header - spans remaining width */}
						<Header
							className='col-start-2'
							showMenuButton={false}
						/>

						{/* Desktop Main content area */}
						<main className='col-start-2 bg-[#f8fafe] overflow-auto'>
							<Outlet />
						</main>
					</div>
				</div>
			</>
		)
	);
}

export default DashboardLayout;
