const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });

const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const User = require("./models/User");
const Department = require("./models/Department");
const Section = require("./models/Section");
const Subject = require("./models/Subject");
const AttendanceSession = require("./models/AttendanceSession");
const AttendanceRecord = require("./models/AttendanceRecord");
const Penalty = require("./models/Penalty");
const AIRiskProfile = require("./models/AIRiskProfile");
const CollegeDocument = require("./models/CollegeDocument");

const seedDemoData = async () => {
  try {
    await connectDB();

    console.log("\n🚀 Seeding IntelliAttend Comprehensive Demo Data...\n");

    // -----------------------------------------
    // CLEAR OLD COLLECTIONS
    // -----------------------------------------
    await AttendanceRecord.deleteMany({});
    await AttendanceSession.deleteMany({});
    await Penalty.deleteMany({});
    await AIRiskProfile.deleteMany({});
    await CollegeDocument.deleteMany({});
    await Subject.deleteMany({});
    await Section.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});

    console.log("🗑️ Prior demo collections cleared.");

    // -----------------------------------------
    // HASH DEFAULT PASSWORD
    // -----------------------------------------
    const hashedPassword = await bcrypt.hash("demo123", 10);

    // -----------------------------------------
    // CREATE DEPARTMENT
    // -----------------------------------------
    const department = await Department.create({
      name: "Computer Science and Engineering",
      code: "CSE",
    });
    console.log("✅ Department created: CSE");

    // -----------------------------------------
    // CREATE SECTION
    // -----------------------------------------
    const section = await Section.create({
      departmentId: department._id,
      year: 3,
      section: "A",
    });
    console.log("✅ Section created: 3rd Year - Section A");

    // -----------------------------------------
    // CREATE ADMIN
    // -----------------------------------------
    await User.create({
      name: "System Administrator",
      email: "admin@intelliattend.edu",
      password: hashedPassword,
      role: "admin",
    });
    console.log("✅ Administrator created: admin@intelliattend.edu");

    // -----------------------------------------
    // CREATE TEACHER
    // -----------------------------------------
    const teacher = await User.create({
      name: "Dr. Ravi Kumar",
      email: "teacher@intelliattend.edu",
      password: hashedPassword,
      role: "teacher",
      employeeId: "FAC001",
      departmentId: department._id,
    });
    console.log("✅ Faculty created: Dr. Ravi Kumar (teacher@intelliattend.edu)");

    // -----------------------------------------
    // CREATE STUDENTS
    // -----------------------------------------
    const students = [
      {
        name: "Ganesh",
        email: "ganesh@student.edu",
        rollNumber: "22N31A0501",
      },
      {
        name: "Rahul Kumar",
        email: "rahul@student.edu",
        rollNumber: "22N31A0502",
      },
      {
        name: "Sai Teja",
        email: "sai@student.edu",
        rollNumber: "22N31A0503",
      },
      {
        name: "Priya Sharma",
        email: "priya@student.edu",
        rollNumber: "22N31A0504",
      },
      {
        name: "Anjali Reddy",
        email: "anjali@student.edu",
        rollNumber: "22N31A0505",
      },
    ];

    const studentDocs = [];
    for (const s of students) {
      const doc = await User.create({
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: "student",
        rollNumber: s.rollNumber,
        departmentId: department._id,
        sectionId: section._id,
      });
      studentDocs.push(doc);

      // Initialize AI Risk Profile
      await AIRiskProfile.create({
        studentId: doc._id,
        totalAttendances: 0,
        qrViolations: 0,
        networkViolations: 0,
        failedVerifications: 0,
        proxyAttempts: 0,
        cumulativeRiskScore: 0,
      });
    }
    console.log(`✅ ${studentDocs.length} Students created with initial AI risk profiles.`);

    // -----------------------------------------
    // CREATE SUBJECT
    // -----------------------------------------
    const subject = await Subject.create({
      subjectName: "Big Data Analytics",
      subjectCode: "BDA301",
      teacherId: teacher._id,
      sectionId: section._id,
    });
    console.log("✅ Subject created: Big Data Analytics (BDA301)");

    // -----------------------------------------
    // SEED COLLEGE DOCUMENTS & SYLLABUS FOR RAG
    // -----------------------------------------
    await CollegeDocument.create({
      title: "Big Data Analytics (BDA301) - Official Course Syllabus",
      category: "syllabus",
      departmentId: department._id,
      subjectId: subject._id,
      tags: ["BDA301", "syllabus", "Hadoop", "MapReduce", "Spark", "NoSQL", "Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"],
      content: `COURSE: Big Data Analytics (Course Code: BDA301)
Department of Computer Science & Engineering | Year: 3 | Semester: VI
Credits: 4 | Instructor: Dr. Ravi Kumar

COURSE OBJECTIVES:
- Understand the architecture of Big Data processing systems.
- Master distributed storage with Hadoop Distributed File System (HDFS).
- Implement parallel computing using MapReduce and Apache Spark.
- Design and query distributed NoSQL databases including MongoDB, Cassandra, and HBase.

SYLLABUS UNITS:
UNIT 1: INTRODUCTION TO BIG DATA & HADOOP ECOSYSTEM
- Definition of Big Data: The 5 V's (Volume, Velocity, Variety, Veracity, Value).
- Distributed computing fundamentals, commodity clusters, and fault tolerance.
- Hadoop Architecture: NameNode, DataNode, Secondary NameNode, Block replication.
- Hadoop Ecosystem Overview: YARN, HDFS, MapReduce, Pig, Hive, HBase, Sqoop, Flume.

UNIT 2: MAPREDUCE PROGRAMMING & PROCESSING
- The MapReduce paradigm: Mapper, Reducer, Combiner, and Partitioner.
- Data flow in MapReduce jobs: split, map, shuffle, sort, reduce, output.
- MapReduce design patterns: Inverted indexing, word count, log analysis, matrix multiplication.
- Debugging and optimizing MapReduce execution on YARN.

UNIT 3: APACHE SPARK & RESILIENT DISTRIBUTED DATASETS (RDD)
- Limitations of traditional MapReduce and the emergence of In-Memory computation.
- Spark Core Architecture: Driver program, Cluster Manager, Executors, Worker Nodes.
- Resilient Distributed Datasets (RDDs): Transformations (map, filter, flatMap) and Actions (count, collect, reduce).
- Spark DataFrames and Spark SQL: Structured data processing and catalyst optimizer.
- Introduction to Spark Streaming and GraphX.

UNIT 4: NOSQL DATABASES & DISTRIBUTED DATA STORES
- CAP Theorem (Consistency, Availability, Partition Tolerance) and BASE properties.
- Classification of NoSQL Systems: Key-Value (Redis), Column-Family (Cassandra, HBase), Document (MongoDB), Graph (Neo4j).
- MongoDB: Documents, Collections, CRUD operations, BSON, indexing strategies, and Aggregation Pipeline.
- HBase: Architecture, RegionServers, HMaster, MemStore, HFile, column families.

UNIT 5: DATA WAREHOUSING & ADVANCED ANALYTICS
- Apache Hive: Hive QL, Metastore, Managed vs External tables, Partitioning and Bucketing.
- Machine learning at scale: Spark MLlib algorithms (classification, clustering, recommendation).
- Graph analytics with GraphX: PageRank, connected components, triangle counting.

TEXTBOOKS & REFERENCE MATERIALS:
1. Tom White, "Hadoop: The Definitive Guide", 4th Edition, O'Reilly Media.
2. Bill Chambers and Matei Zaharia, "Spark: The Definitive Guide", O'Reilly Media.
3. Pramod J. Sadalage and Martin Fowler, "NoSQL Distilled", Addison-Wesley.

ASSESSMENT SCHEME:
- Internal Mid-Term Exams (2 exams): 30%
- Continuous Lab Evaluation & Assignments: 20%
- Semester End University Examination: 50%
- Mandatory Attendance Requirement: Minimum 75% to appear in examinations.`,
    });

    await CollegeDocument.create({
      title: "IntelliAttend Institutional Attendance & Anti-Proxy Regulation 2026",
      category: "policy",
      departmentId: department._id,
      tags: ["attendance", "policy", "penalty", "proxy", "7 days", "verification", "risk score"],
      content: `OFFICIAL ATTENDANCE AND ANTI-PROXY REGULATION - INTELLIATTEND UNIVERSITY (2026)

1. MANDATORY ATTENDANCE CRITERIA:
- Every registered student must maintain a minimum of 75% attendance in each theoretical and practical course to be eligible to sit for the Semester End Examinations.
- Condonation of attendance deficiency between 65% and 75% is granted solely on genuine medical grounds subject to approval by the Dean of Academic Affairs.

2. DIGITAL ATTENDANCE & PROXY PREVENTION:
- All attendance records are processed through the IntelliAttend platform using dynamic rotating QR codes projected by course instructors.
- QR codes rotate every 60 seconds. Attempting to scan expired QR codes or sharing screenshots will increment the student's AI Risk Score.

3. DEVICE & NETWORK FINGERPRINTING:
- Each student is permitted to scan attendance only from their designated registered device.
- If multiple student IDs attempt to mark attendance from the same device in the same session, the system automatically detects a Proxy Attempt (+100 Risk Score).
- Attendance must be marked via the campus Wi-Fi network (Subnet 192.168.x.x / 10.x.x.x). Scans originating from external cellular networks trigger a +50 Risk Score and mandatory verification.

4. END-OF-SESSION AI VERIFICATION & 7-DAY PENALTY:
- At the close of each attendance session, the AI Engine selects candidates for mandatory physical verification based on:
  a) High risk scores (>= 50) and network/QR anomalies.
  b) Random sampling of attendees for unpredictable audit.
- If a student selected for verification is absent, cannot be physically verified, or is confirmed to have committed a proxy attempt:
  a) The student is marked ABSENT for the session.
  b) An AUTOMATIC 7-DAY ACTIVE PENALTY is instantly enforced by the system.
  c) During the active penalty period (7 calendar days), the student is BLOCKED from scanning or recording attendance in all courses.
  d) The student accumulates +30 points to their cumulative AI Risk Score.
  e) Penalties can only be revoked after formal hearing by the Academic Disciplinary Committee.`,
    });

    await CollegeDocument.create({
      title: "Academic Calendar & Examination Schedule (Current Academic Year)",
      category: "academic_calendar",
      departmentId: department._id,
      tags: ["calendar", "exams", "midterm", "practical", "semester", "dates"],
      content: `ACADEMIC CALENDAR & EXAMINATION SCHEDULE - B.TECH 3RD YEAR (CSE)

KEY DATES & TIMELINES:
- Commencement of Class Work: August 1
- First Mid-Term Examinations: October 10 - October 15
- Mid-Term 1 Marks Submission & Risk Audit: October 20
- Second Mid-Term Examinations: December 1 - December 6
- Practical Laboratory Examinations: December 12 - December 18
- Semester End Theory Examinations: January 3 - January 20
- Final Results Announcement: February 10

EXAMINATION RULES:
1. Students must produce their official ID card and hall ticket for every examination.
2. Students with active penalties or attendance below 75% will not be issued examination hall tickets.
3. Electronic gadgets and smartwatches are strictly prohibited inside the examination halls.`,
    });

    console.log("✅ 3 College Knowledge Base documents (Syllabus, Regulations, Academic Calendar) seeded.");

    console.log("\n=======================================================");
    console.log("🎉 INTELLIATTEND DEMO DATA SEEDED SUCCESSFULLY");
    console.log("=======================================================\n");
    console.log("ADMIN LOGIN:");
    console.log("Email: admin@intelliattend.edu | Password: demo123\n");
    console.log("TEACHER LOGIN:");
    console.log("Email: teacher@intelliattend.edu | Password: demo123\n");
    console.log("STUDENT LOGINS (Password: demo123 for all):");
    students.forEach((s, idx) => {
      console.log(`${idx + 1}. ${s.email} (${s.name} - ${s.rollNumber})`);
    });
    console.log("\n=======================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR WHILE SEEDING DEMO DATA:", error);
    process.exit(1);
  }
};

seedDemoData();