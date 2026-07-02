export interface SentimentPoint {
  timestamp: string;
  engagement: number;
  sentiment: string;
  speaker: "Interviewer" | "Candidate";
}

export interface TranscriptItem {
  timestamp: string;
  speaker: "Interviewer" | "Candidate";
  text: string;
}

export interface AnalysisResult {
  interviewerName: string;
  candidateName: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  sentimentPoints: SentimentPoint[];
  transcript: TranscriptItem[];
}

export interface SampleRecording {
  id: string;
  title: string;
  description: string;
  role: string;
  duration: string;
  result: AnalysisResult;
}
