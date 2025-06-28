import { supabase } from "@/utils/supabase.utils";
import showToast from "@/utils/toast.utils";
import BoltBadge from "@/components/common/BoltBadge";
import { useState } from "react";

const addEmail = async (email: string) => {
	// Fix: Insert as an object with the correct column name
	const { data, error } = await supabase
		.from("waitlist")
		.insert([{ email: email }]) // Changed from .insert([email]) to .insert([{ email: email }])
		.select()
		.single();

	if (error) {
		throw error;
	}
	return data;
};

function Waitlist() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (email) {
				setIsLoading(true);
				await addEmail(email);
				setEmail("");

				showToast.success("Email added");
			}
		} catch (error) {
			console.log(error);
			showToast.error("Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<div className='min-h-screen'>
			<div className='min-h-screen flex flex-col items-center justify-center noice bg-app-primary overflow-hidden relative bottom-[40%]'>
				<img
					src='/icons/logo.svg'
					alt=''
					className='md:w-[3.7rem] w-[3rem] mb-2'
				/>

				<h1 className='mt-5 text-gray-200 font-marlin text-2xl sm:text-3xl md:text-3xl lg:text-[2.7rem] text-center'>
					Join the Nora AI Waitlist!
				</h1>
				<p className='hidden text-md md:text-lg text-[#ffffffd5] text-center mx-4 mt-4 '>
					Be the first to get exclusive updates, early access, and special
					offers for Nora <br className='hidden md:block' /> — the AI tutor
					app that helps you learn smarter.
				</p>
				<form
					className='flex flex-col md:flex-row gap-4 w-full max-w-lg mt-6 px-4 md:px-0'
					onSubmit={handleSubmit}>
					<input
						type='email'
						value={email}
						required
						onChange={(e) => setEmail(e.target.value)}
						placeholder='Enter Your Email'
						className='flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white text-gray-800 placeholder-gray-500 text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-30 transition-all duration-200'
					/>
					<button className='px-6 sm:px-8 py-3 sm:py-4 text-gray-800 bg-gray-50 font-montserrat font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100/45 transition-all duration-200 text-base sm:text-lg whitespace-nowrap flex items-center justify-center gap-2'>
						{isLoading ? "Joining..." : "Join"}
						{!isLoading && (
							<img
								src='/icons/send.svg'
								alt=''
								className=' w-5 h-5  '
							/>
						)}
					</button>
				</form>

				{/* Additional Info */}
				<div className='mt-8 text-cente mb-[8rem] md:mb-0'>
					<p className='text-white text-opacity-60 text-lg '>
						Join learners already on the waitlist.
					</p>

					<div className='flex items-center justify-center mt-6 space-x-2'>
						<div className='flex -space-x-4'>
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className='w-10 h-10 bg-white bg-opacity-30 rounded-full border-[3px] border-white overflow-hidden'>
									<img
										src={`/images/avatar-${i}.jpeg`}
										alt=''
										className='w-full h-full object-cover object-top'
									/>
								</div>
							))}
						</div>
						<span className='text-white text-opacity-70 text-md font-medium'>
							20+ People joined
						</span>
					</div>
				</div>
				<div className='flex items-center space-x-4 mt-7 absolute left-1/2 -translate-x-1/2 bottom-[20%] md:bottom-10'>
					<a
						href='https://noratutor.xyz'
						target='_blank'
						className='p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all duration-200 group'>
						<img
							src='/icons/x.svg'
							className='w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200'
							alt=''
						/>
					</a>
				</div>
				<img
					src='/icons/bolt.svg'
					alt=''
					className='.hidden w-[70%] max-w-[21rem] md:w-[37%] absolute right-0 translate-x-[29%]  md:translate-x-[37%] bottom-0 sm:translate-y-[10%] translate-y-[30%] md:translate-y-[50%]  '
				/>
			</div>
			<BoltBadge />
		</div>
	);
}

export default Waitlist;
