import React, { useRef, useState, useEffect } from "react";
import femaleVideo from "../assets/videos/female-ai.mp4";
import maleVideo from "../assets/videos/male-ai.mp4";
import Timer from "./Timer";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import { motion } from "motion/react";
import axios from "axios";

const Step2Interview = ({ interviewData, onFinish }) => {
  const { interviewId, questions, userName } = interviewData;
  const serverUrl = "https://mern-project-new-k9x9.onrender.com"; // replace with your backend URL

  const [isIntroPhase, setIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex];
  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find((v) =>
        ["zira", "samantha", "female"].some((name) =>
          v.name.toLowerCase().includes(name)
        )
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice = voices.find((v) =>
        ["david", "mark", "male"].some((name) =>
          v.name.toLowerCase().includes(name)
        )
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Speech synthesis
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) return resolve();

      window.speechSynthesis.cancel();
      const humanText = text.replace(/,/g, ",...").replace(/\./g, ". ...");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);
        if (isMicOn) startMic();
        setSubtitle("");
        setTimeout(resolve, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  // Intro and question flow
  useEffect(() => {
    if (!selectedVoice) return;

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );
        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );
        setIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }
        await speakText(currentQuestion.question);
        if (isMicOn) startMic();
      }
    };

    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  // Timer
  useEffect(() => {
    if (isIntroPhase || !currentQuestion || isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          SubmitAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, isSubmitting]);

  // Webkit speech recognition setup
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const toggleMic = () => {
    if (isMicOn) stopMic();
    else startMic();
    setIsMicOn(!isMicOn);
  };

  // Submit current answer
  const SubmitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        serverUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true }
      );

      setFeedback(result.data.feedback);
      await speakText(result.data.feedback);
      handleNext();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Next question
  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
  if (currentIndex + 1 >= questions.length) {
  const report = await finishInterview();
  onFinish?.(report);
  return;
}

    await speakText("Alright, let's move to the next question");
    setCurrentIndex(currentIndex + 1);
    setTimeLeft(questions[currentIndex + 1]?.timeLimit || 60);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);
  };

  // Finish interview
  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        serverUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true }
      );
      return result.data;
    } catch (error) {
       console.log(error.response?.data || error.message)
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#eaf6f3] flex items-start justify-center py-16 px-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl flex">
        {/* LEFT PANEL */}
        <div className="w-[35%] p-8 border-r border-gray-200 flex flex-col gap-6">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              className="w-full object-cover"
            />
          </div>

          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          {/* TIMER CARD */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Interview Status</span>
              {isAIPlaying && (
                <span className="text-emerald-600 font-semibold">AI Speaking</span>
              )}
            </div>

            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit || 60}
              />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="grid grid-cols-2 text-center text-sm">
              <div>
                <p className="text-emerald-600 font-bold text-lg">{currentIndex + 1}</p>
                <p className="text-gray-400">Current Question</p>
              </div>
              <div>
                <p className="text-emerald-600 font-bold text-lg">{questions.length}</p>
                <p className="text-gray-400">Total Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-12 flex flex-col">
          <h2 className="text-xl font-semibold text-emerald-600 mb-6">
            AI Smart Interview
          </h2>

          {!isIntroPhase && (
            <div className="bg-gray-100 rounded-2xl p-6 mb-6">
              <p className="text-xs text-gray-400 mb-2">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <p className="text-md font-semibold text-gray-800">
                {currentQuestion?.question}
              </p>
            </div>
          )}

          <div className="bg-gray-100 rounded-2xl p-6 mb-8">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-[360px] bg-[#f3f4f6] rounded-xl p-5 text-gray-800 outline-none resize-none border border-gray-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {!feedback ? (
            <div className="flex items-center gap-4">
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white shadow-md"
              >
                {isMicOn ? <FaMicrophone size={14} /> : <FaMicrophoneSlash size={14} />}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={SubmitAnswer}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium shadow-md transition disabled:bg-gray-500"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
            >
              <p className="text-emerald-700 font-medium mb-4">{feedback}</p>
              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1"
              >
                Next Question <BsArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Interview;
