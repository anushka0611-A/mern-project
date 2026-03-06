import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
} from "react-icons/fa";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice"; // adjust path if needed

const serverUrl = "http://localhost:8000"; // change if deployed

const Step1SetUp = ({ onStart }) => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef();

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;

    try {
      setAnalyzing(true);

      const formData = new FormData();
      formData.append("resume", resumeFile);

      const result = await axios.post(
        `${serverUrl}/api/interview/resume`,
        formData,
        { withCredentials: true }
      );

      console.log("Backend response:", result.data);

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);
    } catch (error) {
      console.log(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        serverUrl + "/api/interview/generate-questions",
        { role, experience, mode, resumeText, projects, skills },
        { withCredentials: true }
      );

      console.log(result.data);

      if (userData) {
        dispatch(
          setUserData({
            ...userData,
            credits: result.data.creditLeft,
          })
        );
      }

      onStart(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4"
    >
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
        {/* LEFT SIDE */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center">
          <h2 className="text-4xl font-bold text-gray-700 mb-6">
            Start your AI Interview
          </h2>

          <div className="space-y-5">
            {[
              {
                icon: <FaUserTie className="text-green-600 text-xl" />,
                text: "Choose Role & Experience",
              },
              {
                icon: <FaMicrophoneAlt className="text-green-600 text-xl" />,
                text: "Smart Voice Interview",
              },
              {
                icon: <FaChartLine className="text-green-600 text-xl" />,
                text: "Performance Analysis",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm"
              >
                {item.icon}
                <span className="text-gray-700 font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-12 bg-white">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Interview Setup
          </h2>

          <div className="space-y-6">
            {/* Role */}
            <div className="relative">
              <FaUserTie className="absolute top-4 left-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Experience */}
            <div className="relative">
              <FaBriefcase className="absolute top-4 left-4 text-gray-400" />
              <input
                type="text"
                placeholder="Experience (e.g. 2 years)"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Mode */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-green-500"
            >
              <option value="Technical">Technical Interview</option>
              <option value="HR">HR Interview</option>
            </select>

            {/* Resume Upload */}
            {!analysisDone ? (
              <div
                onClick={() =>
                  !resumeFile && fileInputRef.current.click()
                }
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition"
              >
                <FaFileUpload className="text-4xl mx-auto text-green-600 mb-3" />

                <input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) =>
                    setResumeFile(e.target.files[0])
                  }
                />

                <p className="text-gray-600 font-medium">
                  {resumeFile
                    ? resumeFile.name
                    : "Click to upload resume (Optional)"}
                </p>

                {resumeFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume();
                    }}
                    className="mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-300 text-green-700 p-4 rounded-xl text-center font-medium">
                ✅ Resume analyzed successfully
              </div>
            )}
            {analysisDone && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4"
  >
    <h3 className="text-lg font-semibold text-gray-800">
      Resume Analysis Result
    </h3>

    {projects.length > 0 && (
      <div>
        <p className="font-medium text-gray-700 mb-1">Projects:</p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          {projects.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    )}

    {skills.length > 0 && (
      <div>
        <p className="font-medium text-gray-700 mb-1">Skills:</p>
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <span
              key={i}
              className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    )}
  </motion.div>
)}

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={!role || !experience || loading}
              className={`w-full py-3 rounded-full text-lg font-semibold transition 
                ${
                  role && experience
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >
              {loading ? "starting..." : "Start Interview"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step1SetUp;