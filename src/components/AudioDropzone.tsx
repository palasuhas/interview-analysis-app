import React, { useState, useRef, useEffect } from "react";
import { Upload, Mic, Square, AlertCircle, FileAudio, Play, HelpCircle } from "lucide-react";
import { SAMPLE_RECORDINGS } from "../data/samples";
import { SampleRecording } from "../types";

interface AudioDropzoneProps {
  onAnalyzeStart: () => void;
  onAnalysisSuccess: (result: any) => void;
  onAnalysisError: (error: string) => void;
  onSelectSample: (sample: SampleRecording) => void;
  isAnalyzing: boolean;
}

export default function AudioDropzone({
  onAnalyzeStart,
  onAnalysisSuccess,
  onAnalysisError,
  onSelectSample,
  isAnalyzing,
}: AudioDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        setSelectedFile(file);
        setAudioBlob(null);
      } else {
        onAnalysisError("Please upload a valid audio file (e.g., MP3, WAV, M4A).");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("audio/")) {
        setSelectedFile(file);
        setAudioBlob(null);
      } else {
        onAnalysisError("Please select a valid audio file.");
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        setSelectedFile(null);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access denied:", err);
      onAnalysisError(
        "Could not access microphone. Please check system permissions or upload an audio file instead."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Convert File or Blob to Base64 to send to backend
  const analyzeAudio = async () => {
    let source: Blob | File | null = selectedFile || audioBlob;
    if (!source) return;

    onAnalyzeStart();

    try {
      const reader = new FileReader();
      reader.readAsDataURL(source);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(",")[1];
        const mimeType = source.type || "audio/webm";

        const response = await fetch("/api/analyze-audio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audio: base64data,
            mimeType,
            name: selectedFile ? selectedFile.name : `recording_${Date.now()}.webm`,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to analyze interview audio.");
        }

        const data = await response.json();
        onAnalysisSuccess(data);
      };
    } catch (error: any) {
      console.error(error);
      onAnalysisError(error.message || "An unexpected error occurred during audio upload.");
    }
  };

  return (
    <div id="audio-dropzone-container" className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Upload & Record Area */}
      <div id="upload-panel" className="lg:col-span-3 space-y-6">
        <div
          id="dropzone-area"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
            isDragActive
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40"
          }`}
        >
          <input
            id="audio-file-input"
            type="file"
            accept="audio/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleFileInput}
            disabled={isAnalyzing || isRecording}
          />

          <div id="dropzone-icon" className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-full mb-4">
            <Upload className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>

          <h3 id="dropzone-title" className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Upload Interview Recording
          </h3>
          <p id="dropzone-desc" className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs mb-4">
            Drag and drop your audio file here, or click to browse. Supports MP3, WAV, M4A, etc.
          </p>

          <div id="upload-divider" className="flex items-center w-full max-w-xs my-3">
            <hr className="w-full border-slate-200 dark:border-slate-800" />
            <span className="px-3 text-xs text-slate-400 dark:text-slate-500 uppercase font-medium">or</span>
            <hr className="w-full border-slate-200 dark:border-slate-800" />
          </div>

          {/* Record Section */}
          <div id="record-control-container" className="relative z-20 flex flex-col items-center">
            {isRecording ? (
              <div id="recording-active-state" className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/10 rounded-full text-red-500 animate-pulse">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Recording Interview</span>
                </div>
                <span id="recording-timer" className="text-2xl font-mono font-medium text-slate-800 dark:text-slate-100">
                  {formatDuration(recordingDuration)}
                </span>
                <button
                  id="stop-record-btn"
                  onClick={stopRecording}
                  type="button"
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-full transition-all shadow-lg hover:shadow-red-600/20 active:scale-95"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Recording</span>
                </button>
              </div>
            ) : (
              <button
                id="start-record-btn"
                onClick={startRecording}
                type="button"
                disabled={isAnalyzing}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-medium px-5 py-2.5 rounded-full transition-all active:scale-95 disabled:opacity-50"
              >
                <Mic className="w-4 h-4 text-emerald-500" />
                <span>Record via Mic</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Audio Preview & Analysis Trigger */}
        {(selectedFile || audioBlob) && !isRecording && (
          <div
            id="audio-preview-card"
            className="p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in"
          >
            <div id="audio-preview-info" className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                <FileAudio className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base truncate max-w-[200px] sm:max-w-[320px]">
                  {selectedFile ? selectedFile.name : "Voice Recording"}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready for AI Interview Analysis
                </p>
              </div>
            </div>
            <button
              id="analyze-trigger-btn"
              onClick={analyzeAudio}
              disabled={isAnalyzing}
              type="button"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-emerald-600/15 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analyzing Call...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Analyze Recording</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Demo Samples Area */}
      <div id="samples-panel" className="lg:col-span-2 space-y-4 flex flex-col">
        <div id="samples-header" className="flex items-center space-x-2 text-slate-500">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            No recording ready? Try a Demo
          </span>
        </div>

        <div id="samples-list" className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
          {SAMPLE_RECORDINGS.map((sample) => (
            <div
              id={`sample-card-${sample.id}`}
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className="group cursor-pointer p-4 bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 hover:shadow-sm rounded-xl transition-all flex flex-col justify-between space-y-3 hover:translate-y-[-1px]"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                    {sample.duration} Demo
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    ★ Score: {sample.result.overallScore}%
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {sample.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/60 text-xs">
                <span className="text-slate-400 truncate max-w-[150px]">
                  Role: {sample.role}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
                  <span>Load Sample</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
