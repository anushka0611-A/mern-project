import React from "react";
import { BsRobot } from "react-icons/bs";
import { IoSparklesOutline } from "react-icons/io5";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { FaTimes } from "react-icons/fa";
function Auth({ isModel = false, onClose }) {
  const dispatch = useDispatch();
  const ServerUrl = import.meta.env.VITE_SERVER_URL;

  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      const user = response.user;

      const result = await axios.post(
        `${ServerUrl}/api/auth/google`,
        {
          name: user.displayName,
          email: user.email,
        },
        { withCredentials: true }
      );
console.log("Backend response:", result.data); 
      dispatch(setUserData(result.data.user));

      if (isModel && onClose) onClose();
    } catch (error) {
      console.log(error);
      dispatch(setUserData(null));
    }
  };

  return (
    <div
      className={
        isModel
          ? "fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          : "min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4"
      }
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-7 relative"
      >
        
      {isModel && (
  <button
    onClick={() => onClose?.()}
    type="button"
    className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg transition"
  >
    <FaTimes size={18} />
  </button>
)}

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h2 className="text-sm font-semibold">InterViewIQ.AI</h2>
        </div>

        {/* Heading */}
        <h1 className="text-lg font-semibold text-center mb-4">
          Continue with
        </h1>

        {/* Green Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 text-green-600 px-5 py-2 rounded-full flex items-center gap-2 text-sm font-medium w-fit">
            <IoSparklesOutline size={16} />
            AI Smart Interview
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-center text-sm leading-relaxed mb-7">
          Sign in to start AI-powered mock interviews, track your progress,
          and unlock detailed performance insights.
        </p>

        {/* Google Button */}
        <motion.button
          onClick={handleGoogleAuth}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full font-medium shadow-md hover:opacity-90 transition"
        >
          <FcGoogle size={20} />
          Continue with Google
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Auth;