// API Types based on backend documentation

export interface SessionResponse {
  session_id: string;
}

export interface OtpResponse {
  human: boolean;
  credential: boolean;
  success: boolean;
  temp_token?: string;
  error?: string;
}

export interface LoginResponse {
  verified: boolean;
  success: boolean;
  access_token?: string;
  username?: string;
  batch?: "A" | "B";
  error?: string;
}

export interface UserProfile {
  rollNo: string;
  batch: "A" | "B";
  teamId: string | null;
  editAttemptsLeft: number;
  currentChoices: string[];
}

export interface Student {
  rollNo: string;
  selectable: boolean;
}

export interface StudentsResponse {
  batch: "A" | "B";
  students: Student[];
}

export interface SelectionResponse {
  saved?: boolean;
  editAttemptsLeft?: number;
  teamFormed?: boolean;
  error?: string;
}

export interface TeamStatus {
  state: "formed" | "pending";
  batch: "A" | "B";
  team?: string[];
}

export interface ApiError {
  error: string;
}
