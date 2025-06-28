import { LogOut } from "lucide-react";

import { useNavigate } from "react-router";

function Header() {
	const naviagate = useNavigate();

	return (
		<header className='absolute flex items-center justify-between w-full max-w-6xl  md:top-[8vh] top-[5vh]  left-1/2 -translate-x-1/2 px-4 md:px-6 lg:px-0 z-20'>
			<div className='flex items-center gap-1'>
				<img
					src='/icons/logo.svg'
					alt='Nora AI Logo'
					className='h-[1.4rem] md:h-[1.7rem] mb-2'
				/>
				<p className='text-white font-montserrat font-medium text-xl '>
					Nora AI
				</p>
			</div>
			<div>
				<button
					onClick={() => naviagate("/auth")}
					className='bg-white text-app-primary font-marlin rounded-lg px-3 py-2 md:px-6 md:py-2 shadow-lg flex items-center justify-center gap-2 text-sm md:text-base font-medium transition-all hover:shadow-xl'>
					<span className='inline'>Sign In</span>
					<LogOut className='w-5' />
				</button>
			</div>
		</header>
	);
}

export default Header;
