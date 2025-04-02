
Frontend-- >
  React js / typescript
Backend -- >
  Express js 

Database -- >
  Mongodb (mongoose)


There are 3 logins -- >


 Admin (creator) -- > 
 admin will able to create student , create faculty , able to show the student data , results.. , able to delete suspend faculty and student..


 Faculty (Authorizor)-->
 Able to create the student or able to Authorize the student ..
 Able to add Iat marks , assignmnet marks through Excel sheets..
 Able to delete the student ..
 Aprooving mini mooc project title..
 able to search the student with his name or usn to get his all dasboard details his ia marks and other all details

 Student (Authorized)-->
 Student register or login .. 
 After authorization through Faculty..
 Student will able to fill his Student Profile details..
 Able to upload mooc and mini project along with his ppt/pdf/docs.. also certificate this details will verified by faculty
 Student will able to see the IA Marks for any semester he cant edit .

 Frontend React js -- >
  src /
    -> StudentProfile.jsx
    -> PreviousAcademicDetails.jsx
    -> HobiesAndPrevious.jsx
    -> AdmissionDetails.jsx
    -> Attendence.jsx
    -> Performance.jsx
    -> MoocCourseRecord.jsx
    -> MiniProject.jsx 
    -> ResultAndArearRecord.jsx
    

---------------------------------------------------------------------------------------------------------

->> Project Structure --(Backend) ..
   
    student-management-system-backend/
│── src/
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── facultyController.js
│   │   ├── studentController.js
│   │   ├── authController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Faculty.js
│   │   ├── Admin.js
│   │   ├── IARecord.js
│   │   ├── MiniProject.js
│   │   ├── MoocCourse.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── facultyRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── authRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   ├── config/
│   │   ├── db.js
│   │   ├── dotenv.js
│   ├── utils/
│   │   ├── excelParser.js
│   ├── public/
│   │   ├── uploads/ (For storing uploaded project files)
│   ├── app.js
│   ├── server.js
│── package.json
│── .env
│── .gitignore
│── README.md

-----------------------------------------------------------------------------------------------------

--> Project structure for frontend 
 

  student-management-system-frontend/
│── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── StudentProfile.jsx
│   │   ├── PreviousAcademicDetails.jsx
│   │   ├── HobiesAndPrevious.jsx
│   │   ├── AdmissionDetails.jsx
│   │   ├── Attendence.jsx
│   │   ├── Performance.jsx
│   │   ├── MoocCourseRecord.jsx
│   │   ├── MiniProject.jsx
│   │   ├── ResultAndArearRecord.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   ├── services/
│   │   ├── api.js
│   ├── hooks/
│   │   ├── useAuth.js
│   ├── assets/
│   │   ├── logo.png
│   │   ├── styles.css
│   ├── App.jsx
│   ├── main.jsx
│   ├── router.jsx
│── .env
│── package.json
│── vite.config.js
│── .gitignore
│── README.md


---------------------------------------------------------------------------------------------------------
 

 📌 API Endpoints
Authentication (/api/auth/)

Method	Route	Description

POST	/login	User login
POST	/register	Register user


Admin Routes (/api/admin/)

Method	Route	Description

POST	/create-student	Create a new student
POST	/create-faculty	Create a new faculty
GET	/students	Get all students
DELETE	/student/:id	Delete/suspend student
Faculty Routes (/api/faculty/)
Method	Route	Description
POST	/authorize-student	Approve a student registration
POST	/upload-ia-marks	Upload IA marks via Excel
GET	/students/:usn	Get student details by USN
Student Routes (/api/student/)
Method	Route	Description
POST	/upload-mooc	Upload MOOC course details
POST	/upload-mini-project	Upload Mini Project details
GET	/ia-marks/:semester	View IA Marks for any semester