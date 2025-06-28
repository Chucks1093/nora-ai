import { useParams, useLocation } from "react-router";
import SessionCall from "@/components/sessioncall";

interface LocationState {
	conversationUrl?: string;
}

function SessionCallPage() {
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const state = location.state as LocationState;

	const conversationUrl = state?.conversationUrl;

	if (!conversationUrl) {
		return (
			<div className='flex items-center justify-center min-h-screen bg-zinc-950 text-white'>
				<div className='text-center'>
					<p className='text-xl mb-2'>Session not found</p>
					<p className='text-gray-400'>Session ID: {id}</p>
				</div>
			</div>
		);
	}

	return <SessionCall conversationUrl={conversationUrl} />;
}

export default SessionCallPage;
