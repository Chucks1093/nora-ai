// src/service/auth.service.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/utils/env.utils";
import { SessionStatus } from "@/components/dashboard/SessionStatusBadge";

export interface Session {
	id: string | null;
	created_at?: string;
	description?: string;
	user_id: string;
	status: SessionStatus;
	time: string | null;
	duration: number;
	url: string;
	context: string;
	tutor: string;
	replica_id: string;
	personal_id: string;
	tutor_image: string;
	conversation_id: string;
	title: string;
	note?: string;
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
		const response = await fetch(`${this.API_BASE_URL}/conversations`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ conversational_context: context }),
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
			},
		]);

		if (error) throw error;
		return data;
	}

	async pingServer() {
		fetch(`${this.API_BASE_URL}/ping`);
	}

	async getSessionsByUserId(userId: string): Promise<Session[]> {
		const { data, error } = await this.supabase
			.from("sessions")
			.select("*")
			.eq("user_id", userId)
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
}

export const sessionService = new SessionService();
