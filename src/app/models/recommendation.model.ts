export interface RecommendationResult {
  id: number;
  score: number;
  explanation: string;
  generated_image: string | null;
  table: string | null;
  room: number | null;
  created_at: string;
}

export interface RecommendationResponse {
  data: RecommendationResult;
  message: string;
  status: string;
}