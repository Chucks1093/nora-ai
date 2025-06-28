import { redirect } from "react-router";
import { authService } from "@/services/auth.service";
import { sessionService } from "@/services/session.service";
import { Session } from "@/services/session.service";

interface CallParams {
	params: {
		id?: string;
	};
}

export async function getCallDetails({ params }: CallParams) {
	try {
		// Always check authentication first
		const user = await authService.getCurrentUser();

		// Extract the call ID from params
		const callId = params.id;

		// Handle missing call ID
		if (!callId) {
			return {
				user: {
					authenticated: user.authenticated,
					...user,
				},
				session: null,
				isValid: false,
				error: "Call ID is missing from the URL",
			};
		}

		// If user is not authenticated, return early
		// Don't show error toast here as the UI will handle it
		if (!user.authenticated) {
			return {
				user: {
					authenticated: false,
				},
				session: null,
				isValid: false,
			};
		}

		// User is authenticated, try to get session data
		try {
			const sessionData = (await sessionService.getSessionByConversationId(
				callId
			)) as Session;

			// Validate session data
			if (!sessionData || !sessionData.id) {
				return {
					user: {
						authenticated: true,
						...user,
					},
					session: null,
					isValid: false,
					error: "Session not found or has expired",
				};
			}

			// Check if session is still valid/active
			const isValidSession =
				sessionData.status === "SCHEDULED" ||
				sessionData.status === "IN_PROGRESS";

			if (!isValidSession) {
				return {
					user: {
						authenticated: true,
						...user,
					},
					session: sessionData,
					isValid: false,
					error: `Session is ${sessionData.status} and cannot be joined`,
				};
			}

			// Everything is valid
			return {
				user: {
					authenticated: true,
					...user,
				},
				session: {
					...sessionData,
					isValid: true,
				},
				isValid: true,
			};
		} catch (sessionError) {
			console.error("Failed to fetch session data:", sessionError);

			// Session fetch failed, but user is authenticated
			return {
				user: {
					authenticated: true,
					...user,
				},
				session: null,
				isValid: false,
				error: "Unable to load session details. The session may no longer exist.",
			};
		}
	} catch (error) {
		console.error("Failed to load call details:", error);

		// Critical error - redirect to dashboard
		// This handles cases where the auth service itself fails
		throw new Response("Failed to load session", {
			status: 500,
			statusText: "Internal Server Error",
		});
		redirect("/");
	}
}
