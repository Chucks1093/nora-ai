import React, { useState } from "react";
import { useLoaderData } from "react-router";
import SessionCallContent from "@/components/sessioncall/SessionCallContent"; // The component you showed earlier
import UnAuthenticatedUser from "@/components/sessioncall/UnAuthenticatedUser";
import InValidSession from "@/components/sessioncall/InValidSession";
import CallEntry from "@/components/sessioncall/CallEntry";
import { Session } from "@/services/session.service";
import { Profile } from "@/hooks/dashboard/useProfileStore";
import SessionCallOverlay from "@/components/sessioncall/SessionCallOverlay";

interface LoaderData {
	user: Profile;
	session?: Session;
	isValid?: boolean;
}

const SessionCallPage: React.FC = () => {
	const loaderData = useLoaderData() as LoaderData;
	const [inCall, setInCall] = useState(() => {
		const searchParams = new URLSearchParams(window.location.search);
		return searchParams.get("incall") === "true";
	});

	if (!loaderData?.user?.authenticated) {
		return (
			<SessionCallOverlay>
				<UnAuthenticatedUser />
			</SessionCallOverlay>
		);
	}

	// Invalid Session Scenario
	if (!loaderData.session || !loaderData.isValid || !loaderData.isValid) {
		return (
			<SessionCallOverlay>
				<InValidSession />
			</SessionCallOverlay>
		);
	}

	const session = loaderData.session as Session;

	// In Call - Show the actual call interface
	if (inCall) {
		return (
			<SessionCallContent
				conversationUrl={session.url}
				conversationId={session.conversation_id}
			/>
		);
	}

	return (
		<SessionCallOverlay>
			<CallEntry
				{...session}
				setInCall={setInCall}
			/>
		</SessionCallOverlay>
	);
};

export default SessionCallPage;
