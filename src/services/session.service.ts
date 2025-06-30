// src/service/auth.service.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/utils/env.utils";
import { SessionStatus } from "@/components/dashboard/SessionStatusBadge";
import showToast from "@/utils/toast.utils";

export interface Session {
	id?: string | null;
	created_at?: string;
	description?: string;
	user_id: string;
	status: SessionStatus;
	duration: number;
	url: string;
	context: string;
	tutor: string;
	tutor_personality: string;
	replica_id: string;
	personal_id: string;
	tutor_image: string;
	title: string;
	conversation_id: string;
	notes?: string;
	scheduled_time?: string;
	call_link?: string;
	call_id?: string;
}

export interface SessionCreationInput {
	userId: string; // User ID from Supabase auth
	duration: number; // Session duration in minutes
	conversation_context: string; // Context for AI to generate title/description
	tutor: string; // Tutor name
	replica_id: string; // Replica AI model ID
	tutor_image: string; // URL to tutor's profile image
	personal_id: string; // Personal identifier for the session
	tutor_personality: string; // Tutor's personality description
	scheduled_time: string; // ISO 8601 datetime string (must be in future)
}

export interface SessionStats {
	user_id: string;
	total_sessions: number;
	scheduled_sessions: number;
	ended_sessions: number;
	total_duration: number;
}

// New interfaces for chart data
export interface SessionChartData {
	month: string;
	sessions: number;
	month_number: number;
}

export interface SessionSummaryData {
	total_sessions: number;
	current_month_sessions: number;
	previous_month_sessions: number;
	percentage_change: number;
}

// Raw response interfaces from Supabase RPC
interface SupabaseChartDataResponse {
	month: string;
	sessions: bigint;
	month_number: number;
}

interface SupabaseSummaryDataResponse {
	total_sessions: bigint;
	current_month_sessions: bigint;
	previous_month_sessions: bigint;
	percentage_change: number;
}

class SessionService {
	private supabase: SupabaseClient;
	public isAdmin = false;
	private API_BASE_URL: string;

	constructor() {
		const supabaseUrl = env.VITE_SUPABASE_URL;
		const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
		this.API_BASE_URL = env.API_BASE_URL;

		this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
			auth: {
				persistSession: true,
				autoRefreshToken: true,
			},
		});
	}

	async getTitle(context: string): Promise<{
		conversational_context: string;
		title: string;
		description: string;
	}> {
		console.log("CONTEXT", context);
		const response = await fetch(`${this.API_BASE_URL}/conversations`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ conversational_context: context }),
		});

		if (!response.ok) {
			showToast.error("Error generating Context");
			throw new Error(`Error: ${response.status}`);
		}

		const data = await response.json();
		return data;
	}

	async scheduleSession(
		input: SessionCreationInput
	): Promise<{ success: boolean; session: SessionCreationInput }> {
		const response = await fetch(`${this.API_BASE_URL}/schedules`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				userId: input.userId,
				duration: input.duration,
				conversation_context: input.conversation_context,
				tutor: input.tutor,
				replica_id: input.replica_id,
				tutor_image: input.tutor_image,
				personal_id: input.personal_id,
				tutor_personality: input.tutor_personality,
				scheduled_time: input.scheduled_time,
			}),
		});

		if (!response.ok) {
			showToast.error("Error generating Context");

			throw new Error(`Error: ${response.status}`);
		}

		const data = await response.json();
		return data;
	}

	async getContextFromFile(
		context: string,
		file: File
	): Promise<{ generated_context: string }> {
		const formData = new FormData();
		formData.append("conversational_context", context);
		formData.append("file", file);

		const response = await fetch(`${this.API_BASE_URL}/attachments`, {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			throw new Error(`Error: ${response.status}`);
		}

		const data = await response.json();
		return data;
	}

	async createsession(input: Session) {
		const { data, error } = await this.supabase.from("sessions").insert([
			{
				user_id: input.user_id,
				status: input.status,
				duration: input.duration,
				url: input.url,
				context: input.context,
				tutor: input.tutor,
				replica_id: input.replica_id,
				personal_id: input.personal_id,
				tutor_image: input.tutor_image,
				title: input.title,
				description: input.description,
				conversation_id: input.conversation_id,
				tutor_personality: input.tutor_personality,
				scheduled_time: input.scheduled_time,
				call_id: input.call_id,
				call_link: input.call_link,
			},
		]);

		if (error) throw error;
		return data;
	}
	async updateSession(id: string, updates: Partial<Session>) {
		const { data, error } = await this.supabase
			.from("sessions")
			.update(updates)
			.eq("id", id)
			.select();

		if (error) throw error;
		return data;
	}

	async updateSessionCall(
		key: keyof Session,
		value: string,
		updates: Partial<Session>
	) {
		const { data, error } = await this.supabase
			.from("sessions")
			.update(updates)
			.eq(key, value)
			.select();

		if (error) throw error;
		return data;
	}

	async updateSessionStatus(
		id: string,
		status: SessionStatus,
		conversation_id?: string,
		url?: string
	) {
		const updates: Partial<Session> = { status };

		if (conversation_id) updates.conversation_id = conversation_id;
		if (url) updates.url = url;

		return this.updateSession(id, updates);
	}

	async getSessionsByUserId(userId: string): Promise<Session[]> {
		const { data, error } = await this.supabase
			.from("sessions")
			.select("*")
			.eq("user_id", userId)
			.neq("status", "SCHEDULED")
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data as Session[];
	}

	async getScheduledSessions(userId: string): Promise<Session[]> {
		const { data, error } = await this.supabase
			.from("sessions")
			.select("*")
			.eq("user_id", userId)
			.eq("status", "SCHEDULED")
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data as Session[];
	}

	async getSessionByConversationId(
		conversationId: string
	): Promise<Session | null> {
		const { data, error } = await this.supabase
			.from("sessions")
			.select("*")
			.eq("conversation_id", conversationId)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No rows returned
				return null;
			}
			throw error;
		}
		return data as Session;
	}

	async getSessionByCallId(callId: string): Promise<Session | null> {
		console.log("callId", callId);
		const { data, error } = await this.supabase
			.from("sessions")
			.select("*")
			.eq("call_id", callId)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				// No rows returned
				return null;
			}
			throw error;
		}
		return data as Session;
	}

	async downloadNote(conversation_id: string): Promise<Blob> {
		const response = await fetch(
			`${this.API_BASE_URL}/notes/${conversation_id}`
		);
		if (!response.ok) {
			throw new Error(
				`Failed to download file: ${response.status} ${response.statusText}`
			);
		}

		// Get the PDF as a blob
		const blob = await response.blob();

		// Create an object URL from the blob
		const objectUrl = URL.createObjectURL(blob);

		// Create a download link and trigger it
		const a = document.createElement("a");
		a.href = objectUrl;

		// Get filename from Content-Disposition header if available
		const contentDisposition = response.headers.get("Content-Disposition");
		const filename = contentDisposition
			? contentDisposition.split("filename=")[1].replace(/"/g, "")
			: "document.pdf";

		a.download = filename;
		document.body.appendChild(a);
		a.click();

		// Clean up
		document.body.removeChild(a);
		URL.revokeObjectURL(objectUrl);

		return blob; // Return the blob if needed elsewhere
	}

	async getUserSessionStats(userId: string): Promise<SessionStats> {
		// Method 1: Using Supabase RPC (Remote Procedure Call)
		const { data, error } = await this.supabase.rpc(
			"get_user_session_stats",
			{
				p_user_id: userId,
			}
		);

		if (error) {
			console.error("Supabase RPC error:", error);
			throw new Error(`Failed to fetch session stats: ${error.message}`);
		}

		// Supabase returns an array, but our function returns a single row
		const stats = data[0];

		if (!stats) {
			// Return default values if no data found
			return {
				user_id: userId,
				total_sessions: 0,
				scheduled_sessions: 0,
				ended_sessions: 0,
				total_duration: 0,
			};
		}

		// Convert BigInt to regular numbers (Supabase returns BigInt for BIGINT columns)
		return {
			user_id: stats.user_id,
			total_sessions: Number(stats.total_sessions),
			scheduled_sessions: Number(stats.scheduled_sessions),
			ended_sessions: Number(stats.ended_sessions),
			total_duration: Number(stats.total_duration),
		};
	}

	// NEW: Get chart data for sessions per month
	async getUserSessionsChartData(
		userId: string,
		year?: number
	): Promise<SessionChartData[]> {
		const currentYear = year || new Date().getFullYear();

		const { data, error } = await this.supabase.rpc(
			"get_user_sessions_chart_data",
			{
				user_id_param: userId,
				year_param: currentYear,
			}
		);

		if (error) {
			console.error("Supabase RPC error:", error);
			throw new Error(
				`Failed to fetch sessions chart data: ${error.message}`
			);
		}

		if (!data) {
			// Return empty array with all months if no data
			const monthNames = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			];

			return monthNames.map((month, index) => ({
				month,
				sessions: 0,
				month_number: index + 1,
			}));
		}

		// Convert BigInt to regular numbers with proper typing
		return (data as SupabaseChartDataResponse[]).map((item) => ({
			month: item.month,
			sessions: Number(item.sessions),
			month_number: Number(item.month_number),
		}));
	}

	// NEW: Get summary data for sessions
	async getUserSessionsSummary(
		userId: string,
		year?: number
	): Promise<SessionSummaryData> {
		const currentYear = year || new Date().getFullYear();

		const { data, error } = await this.supabase.rpc(
			"get_user_sessions_summary",
			{
				user_id_param: userId,
				year_param: currentYear,
			}
		);

		if (error) {
			console.error("Supabase RPC error:", error);
			throw new Error(`Failed to fetch sessions summary: ${error.message}`);
		}

		const summary = data?.[0] as SupabaseSummaryDataResponse | undefined;

		if (!summary) {
			// Return default values if no data found
			return {
				total_sessions: 0,
				current_month_sessions: 0,
				previous_month_sessions: 0,
				percentage_change: 0,
			};
		}

		// Convert BigInt to regular numbers with proper typing
		return {
			total_sessions: Number(summary.total_sessions),
			current_month_sessions: Number(summary.current_month_sessions),
			previous_month_sessions: Number(summary.previous_month_sessions),
			percentage_change: Number(summary.percentage_change),
		};
	}

	// NEW: Get both chart data and summary in a single call (optional optimization)
	async getUserSessionsAnalytics(
		userId: string,
		year?: number
	): Promise<{
		chartData: SessionChartData[];
		summary: SessionSummaryData;
	}> {
		try {
			// Fetch both in parallel for better performance
			const [chartData, summary] = await Promise.all([
				this.getUserSessionsChartData(userId, year),
				this.getUserSessionsSummary(userId, year),
			]);

			return { chartData, summary };
		} catch (error) {
			console.error("Error fetching session analytics:", error);
			throw error;
		}
	}
}

export const sessionService = new SessionService();
