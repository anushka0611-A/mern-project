import express from "express";
import { analyzeResume, finishInterview, generateQuestion, getMyInterviewReport, getMyInterviews, submitAnswer } from "../controllers/interview.controller.js";
import { upload } from "../middlewares/multer.js";
 import isAuth from "../middlewares/isAuth.js";

const interviewRouter = express.Router();

/*
  @route   POST /api/interview/resume
  @desc    Upload and analyze resume
  @access  Private (if using auth)
*/
interviewRouter.post(
  "/resume",
  upload.single("resume"),  
  analyzeResume
);
interviewRouter.post("/generate-questions",isAuth, generateQuestion)
interviewRouter.post("/submit-answer",isAuth, submitAnswer)
interviewRouter.post("/finish", isAuth, finishInterview)
interviewRouter.get("/get-interview", isAuth, getMyInterviews)
interviewRouter.get("/report/:id", isAuth, getMyInterviewReport)


export default interviewRouter;