const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
connectDB();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceSessionRoutes = require("./routes/attendanceSessionRoutes");
const attendanceRecordRoutes = require("./routes/attendanceRecordRoutes");
const penaltyRoutes = require("./routes/penaltyRoutes");
const aiRiskProfileRoutes = require("./routes/aiRiskProfileRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance-sessions", attendanceSessionRoutes);
app.use("/api/attendance-records", attendanceRecordRoutes);
app.use("/api/penalties", penaltyRoutes);
app.use("/api/ai-risk-profile", aiRiskProfileRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("IntelliAttend Backend Running with AI Verification & Gemini RAG");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`);
});