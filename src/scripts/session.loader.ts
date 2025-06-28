import { redirect } from "react-router";
import { authService } from "@/services/auth.service";
import { sessionService } from "@/services/session.service";
import { Session } from "@/services/session.service";

const USER = {
	success: true,
	authenticated: false,
	id: "e45cf928-acbb-4ffd-836e-17912c1de072",
	email: "aniokesebastian@gmail.com",
	updated_at: "2025-06-28T08:43:38.372+00:00",
	avatar:
		"https://lh3.googleusercontent.com/a/ACg8ocJTsStFfzoKak_PiA-tbRENPvAhFeSckErjJD3PckJzyY8s84w=s96-c",
	username: "aniokesebastian",
};

const SESSIONDATA = {
	id: "7f27ab68-5ccc-4889-86b7-4a2adf14846a",
	created_at: "2025-06-28T15:30:35.987287+00:00",
	user_id: "75acf425-06da-4435-a2da-b42e54655665",
	status: "IN_PROGRESS",
	time: null,
	duration: 5,
	url: "https://tavus.daily.co/ccfcf79c3fbdf49e",
	context: "Calculus",
	tutor: "Nora",
	replica_id: "r3a47ce45e68",
	tutor_image: "/images/avatar-1_thumbnail.jpg",
	title: "Calculus Concepts",
	personal_id: "p2f164e98f54",
	description: "Learn fundamental calculus concepts and techniques.",
	notes: null,
	conversation_id: "ccfcf79c3fbdf49e",
};

interface CallParams {
	params: {
		id?: string;
	};
}

export async function getCallDetails({ params }: CallParams) {
	return {
		user: {
			authenticated: true,
			...USER,
		},
		session: SESSIONDATA,
		isValid: true,
		error: "Call ID is missing from the URL",
	};
	// try {
	// 	// Always check authentication first
	// 	const user = await authService.getCurrentUser();

	// 	// Extract the call ID from params
	// 	const callId = params.id;

	// 	// Handle missing call ID
	// 	if (!callId) {
	// 		return {
	// 			user: {
	// 				authenticated: user.authenticated,
	// 				...user,
	// 			},
	// 			session: null,
	// 			isValid: false,
	// 			error: "Call ID is missing from the URL",
	// 		};
	// 	}

	// 	// If user is not authenticated, return early
	// 	// Don't show error toast here as the UI will handle it
	// 	if (!user.authenticated) {
	// 		return {
	// 			user: {
	// 				authenticated: false,
	// 			},
	// 			session: null,
	// 			isValid: false,
	// 		};
	// 	}

	// 	// User is authenticated, try to get session data
	// 	const sessionData = (await sessionService.getSessionByConversationId(
	// 		callId
	// 	)) as Session;

	// 	console.log("SESSIONDATA", sessionData);

	// 	// Validate session data
	// 	if (!sessionData || !sessionData.id) {
	// 		return {
	// 			user: {
	// 				authenticated: true,
	// 				...user,
	// 			},
	// 			session: null,
	// 			isValid: false,
	// 			error: "Session not found or has expired",
	// 		};
	// 	}

	// 	// Check if session is still valid/active
	// 	const isValidSession =
	// 		sessionData.status === "SCHEDULED" ||
	// 		sessionData.status === "IN_PROGRESS";

	// 	if (!isValidSession) {
	// 		return {
	// 			user: {
	// 				authenticated: true,
	// 				...user,
	// 			},
	// 			session: sessionData,
	// 			isValid: false,
	// 			error: `Session is ${sessionData.status} and cannot be joined`,
	// 		};
	// 	}

	// 	// Everything is valid
	// 	return {
	// 		user: {
	// 			authenticated: true,
	// 			...user,
	// 		},
	// 		session: {
	// 			...sessionData,
	// 			isValid: true,
	// 		},
	// 		isValid: true,
	// 	};
	// } catch (error) {
	// 	console.error("Failed to load call details:", error);

	// 	// Critical error - redirect to dashboard
	// 	// This handles cases where the auth service itself fails
	// 	throw new Response("Failed to load session", {
	// 		status: 500,
	// 		statusText: "Internal Server Error",
	// 	});
	// 	redirect("/");
	// }
}
