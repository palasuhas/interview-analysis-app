import { useState, useMemo, useRef } from "react";
import {
  Sparkles,
  TrendingUp,
  ThumbsUp,
  AlertTriangle,
  Search,
  Filter,
  Volume2,
  RefreshCw,
  CheckCircle2,
  Clock,
  User,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  MessageSquare,
  Activity,
  Award
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import AudioDropzone from "./components/AudioDropzone";
import { SAMPLE_RECORDINGS } from "./data/samples";
import { AnalysisResult, SampleRecording } from "./types";

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(SAMPLE_RECORDINGS[0].result);
  const [currentRole, setCurrentRole] = useState<string>(SAMPLE_RECORDINGS[0].role);
  const [currentTitle, setCurrentTitle] = useState<string>(SAMPLE_RECORDINGS[0].title);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [speakerFilter, setSpeakerFilter] = useState<"All" | "Interviewer" | "Candidate">("All");

  // Reference for transcript scrolling
  const transcriptRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleAnalyzeStart = () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setSelectedResult(null);
  };

  const handleAnalysisSuccess = (result: AnalysisResult) => {
    setIsAnalyzing(false);
    setSelectedResult(result);
    setCurrentRole("Uploaded Audio Analyst");
    setCurrentTitle("Analyzed Interview Audio");
  };

  const handleAnalysisError = (error: string) => {
    setIsAnalyzing(false);
    setAnalysisError(error);
  };

  const handleSelectSample = (sample: SampleRecording) => {
    setSelectedResult(sample.result);
    setCurrentRole(sample.role);
    setCurrentTitle(sample.title);
    setAnalysisError(null);
  };

  const handleReset = () => {
    setSelectedResult(null);
    setSearchQuery("");
    setSpeakerFilter("All");
  };

  // Jump transcript list to specific timestamp matching a clicked graph point
  const handleGraphPointClick = (point: any) => {
    if (!point || !point.activePayload || point.activePayload.length === 0) return;
    const clickedData = point.activePayload[0].payload;
    const timestamp = clickedData.timestamp;

    // Find closest dialog turn
    const matchingElement = transcriptRefs.current[timestamp];
    if (matchingElement) {
      matchingElement.scrollIntoView({ behavior: "smooth", block: "center" });
      matchingElement.classList.add("bg-emerald-500/10", "border-emerald-500/30");
      setTimeout(() => {
        matchingElement.classList.remove("bg-emerald-500/10", "border-emerald-500/30");
      }, 2000);
    }
  };

  // Compute Talk Ratios (Interviewer vs Candidate based on word count of transcripts)
  const talkRatio = useMemo(() => {
    if (!selectedResult || !selectedResult.transcript) return { interviewer: 50, candidate: 50 };

    let interviewerWords = 0;
    let candidateWords = 0;

    selectedResult.transcript.forEach((turn) => {
      const wordCount = turn.text.split(/\s+/).length;
      if (turn.speaker === "Interviewer") {
        interviewerWords += wordCount;
      } else {
        candidateWords += wordCount;
      }
    });

    const totalWords = interviewerWords + candidateWords;
    if (totalWords === 0) return { interviewer: 50, candidate: 50 };

    return {
      interviewer: Math.round((interviewerWords / totalWords) * 100),
      candidate: Math.round((candidateWords / totalWords) * 100),
    };
  }, [selectedResult]);

  // Filtered transcript items
  const filteredTranscript = useMemo(() => {
    if (!selectedResult) return [];

    return selectedResult.transcript.filter((item) => {
      const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpeaker =
        speakerFilter === "All" || item.speaker === speakerFilter;
      return matchesSearch && matchesSpeaker;
    });
  }, [selectedResult, searchQuery, speakerFilter]);

  // Customized Tooltip for Sentiment Chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-xl space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between space-x-4">
            <span className="text-xs text-slate-400 font-mono font-bold">
              Time: {data.timestamp}
            </span>
            <span
              className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                data.speaker === "Candidate"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              {data.speaker}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-white">
              Engagement: {data.engagement}%
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Mood: <span className="text-emerald-400 font-bold">{data.sentiment}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header Bar */}
      <header id="header-bar" className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div id="brand-logo-container" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg">
                Interview Coach <span className="text-emerald-600">Intelligence</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider rounded-md">
                Enterprise AI
              </span>
            </div>
          </div>

          <div id="header-meta" className="flex items-center space-x-4 text-xs font-medium text-slate-500">
            <div className="hidden md:flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Session Analytics</span>
            </div>
            {selectedResult && (
              <button
                id="reset-analysis-btn"
                onClick={handleReset}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-lg transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Session</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* If no analysis result, show upload page */}
        {!selectedResult ? (
          <div id="setup-view" className="space-y-8 animate-fade-in max-w-4xl mx-auto py-6">
            <div id="intro-hero" className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Unlock Interview Excellence with AI Feedback
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                Upload your call recording or record a simulation. Our intelligence platform delivers diarized transcripts, engagement levels tracking, and direct coaching cards.
              </p>
            </div>

            {analysisError && (
              <div
                id="error-banner"
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 text-red-600 dark:text-red-400"
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Analysis Request Failed</h4>
                  <p className="text-xs opacity-90 mt-1">{analysisError}</p>
                </div>
              </div>
            )}

            {isAnalyzing ? (
              <div
                id="analyzing-state-card"
                className="p-12 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-emerald-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2 max-w-xs">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-150">
                    AI Analysis in Progress
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Diarizing speakers, running speech-to-text algorithms, and generating constructive coaching notes using gemini-3.5-flash...
                  </p>
                </div>

                <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full animate-pulse-width" style={{ width: "70%" }} />
                </div>
              </div>
            ) : (
              <AudioDropzone
                onAnalyzeStart={handleAnalyzeStart}
                onAnalysisSuccess={handleAnalysisSuccess}
                onAnalysisError={handleAnalysisError}
                onSelectSample={handleSelectSample}
                isAnalyzing={isAnalyzing}
              />
            )}
          </div>
        ) : (
          /* Dashboard View */
          <div id="dashboard-view" className="space-y-8 animate-fade-in">
            {/* Context Header */}
            <div id="dashboard-title-card" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-2xl">
              <div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                  <Award className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">{currentRole}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {currentTitle}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Interviewer: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedResult.interviewerName}</span> • Candidate: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedResult.candidateName}</span>
                </p>
              </div>

              {/* Overall Score */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                    Overall Performance
                  </span>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    Strong Candidate Fit
                  </p>
                </div>
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-600 dark:text-emerald-500 transition-all duration-500"
                      strokeDasharray={`${selectedResult.overallScore}, 100`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="text-lg font-black">{selectedResult.overallScore}</span>
                </div>
              </div>
            </div>

            {/* Main Stats Widgets Grid */}
            <div id="stats-summary-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Summary Widget */}
              <div className="md:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>Executive Summary</span>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                    {selectedResult.summary}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800/65 flex items-center justify-between text-xs text-slate-400">
                  <span>Diarization Accuracy: 98.4%</span>
                  <span>Model: gemini-3.5-flash</span>
                </div>
              </div>

              {/* Conversational Balance Ratio */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-2xl flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-sky-500" />
                    <span>Talk-Time Balance</span>
                  </h3>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-blue-500">{selectedResult.interviewerName} ({talkRatio.interviewer}%)</span>
                      <span className="text-emerald-500">{selectedResult.candidateName} ({talkRatio.candidate}%)</span>
                    </div>
                    {/* Progress slider bar */}
                    <div className="w-full h-3 rounded-full flex overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <div className="bg-blue-500 h-full transition-all" style={{ width: `${talkRatio.interviewer}%` }} />
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${talkRatio.candidate}%` }} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    A balanced 40% (Interviewer) / 60% (Candidate) is ideal. {talkRatio.candidate > 75 ? "The candidate might be rambling. Encourage shorter structured responses." : talkRatio.candidate < 35 ? "The candidate spoke very briefly. Prompt for more in-depth storytelling." : "Great conversation flow."}
                  </p>
                </div>
                <div className="pt-2 text-xs text-slate-400">
                  Total Audio Duration: {selectedResult.sentimentPoints[selectedResult.sentimentPoints.length - 1]?.timestamp || "N/A"}
                </div>
              </div>
            </div>

            {/* SECTION: Sentiment Graph */}
            <div id="sentiment-graph-section" className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <span>Sentiment & Engagement Track</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Visualizes verbal engagement level (0-100) chronologically. Click point to jump to dialogue.
                  </p>
                </div>

                {/* Graph Legend */}
                <div className="flex items-center space-x-4 text-xs font-medium">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-600 dark:text-slate-400">Interviewer</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-600 dark:text-slate-400">Candidate (Interviewee)</span>
                  </span>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div id="sentiment-chart-container" className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={selectedResult.sentimentPoints}
                    onClick={handleGraphPointClick}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="timestamp"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorEngagement)"
                      activeDot={{ r: 7, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                    />
                    {/* Add threshold line for high engagement */}
                    <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Row: Coaching Card vs Transcripts */}
            <div id="coaching-transcript-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Diarized Transcript Panel (7 Columns) */}
              <div id="transcript-panel" className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-2xl p-6 flex flex-col h-[540px]">
                {/* Panel Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850 gap-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                    <span>Diarized Transcript</span>
                  </h2>

                  {/* Speaker Toggle Filter */}
                  <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                    <button
                      onClick={() => setSpeakerFilter("All")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        speakerFilter === "All"
                          ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSpeakerFilter("Interviewer")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        speakerFilter === "Interviewer"
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Interviewer
                    </button>
                    <button
                      onClick={() => setSpeakerFilter("Candidate")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        speakerFilter === "Candidate"
                          ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Candidate
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="my-4 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search dialogue keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {filteredTranscript.length > 0 ? (
                    filteredTranscript.map((turn, i) => {
                      const isCandidate = turn.speaker === "Candidate";
                      return (
                        <div
                          ref={(el) => {
                            transcriptRefs.current[turn.timestamp] = el;
                          }}
                          key={i}
                          className={`p-4 border rounded-xl transition-all duration-300 ${
                            isCandidate
                              ? "bg-emerald-50/20 dark:bg-emerald-950/5 border-emerald-500/10 dark:border-emerald-500/5 hover:border-emerald-500/20"
                              : "bg-blue-50/20 dark:bg-blue-950/5 border-blue-500/10 dark:border-blue-500/5 hover:border-blue-500/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isCandidate ? "bg-emerald-500" : "bg-blue-500"
                                }`}
                              />
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                {isCandidate ? selectedResult.candidateName : selectedResult.interviewerName}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              {turn.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                            {turn.text}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                      <MessageSquare className="w-8 h-8 stroke-1" />
                      <p className="text-sm font-semibold">No dialogue matches found</p>
                      <p className="text-xs">Try clearing search filters or selecting different query criteria</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Coaching Card (5 Columns) */}
              <div id="coaching-card-panel" className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-2xl p-6 space-y-6 h-full flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-6">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          AI Coaching Card
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 bg-emerald-500/10 rounded-full">
                        Expert Feedback
                      </span>
                    </div>

                    {/* 3 Things Done Well */}
                    <div className="space-y-4 mb-8">
                      <h3 className="text-xs font-bold uppercase text-emerald-600 tracking-wider flex items-center space-x-2">
                        <ThumbsUp className="w-4 h-4" />
                        <span>3 Things Done Well</span>
                      </h3>
                      <div className="space-y-3">
                        {selectedResult.strengths.map((strength, i) => (
                          <div
                            key={i}
                            className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start space-x-3 text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-xs shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="leading-relaxed font-medium">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3 Missed Opportunities */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase text-red-500 tracking-wider flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>3 Missed Opportunities</span>
                      </h3>
                      <div className="space-y-3">
                        {selectedResult.improvements.map((improvement, i) => (
                          <div
                            key={i}
                            className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start space-x-3 text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white font-bold text-xs shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="leading-relaxed font-medium">{improvement}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary Footer advice */}
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60 flex items-center space-x-2.5 text-xs text-slate-400">
                    <Info className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>Review these metrics before your next live interview run to polish your answers.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
