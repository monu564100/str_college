# Student Management System

## 📌 Overview

The **Student Management System** is a web-based application designed to streamline student, faculty, and admin interactions. It facilitates student profile management, academic record tracking, IA marks handling, and project submissions.

## 🚀 Tech Stack

### Frontend:

- React.js (with TypeScript)
- Vite.js
- Context API
- Tailwind CSS / CSS Modules

### Backend:

- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (for file uploads)
- ExcelJS (for parsing Excel files)

## 🎯 Features

### 🔹 Admin (Creator)

- Create and manage students and faculty
- View student data and results
- Delete or suspend faculty and students

### 🔹 Faculty (Authorizer)

- Create and authorize students
- Upload IA marks and assignment marks via Excel
- Delete students
- Approve Mini MOOC project titles
- Search students by name or USN

### 🔹 Student (Authorized)

- Register and log in (requires faculty authorization)
- Update student profile details
- Upload MOOC & Mini Project submissions (PPT/PDF/DOCs, Certificates)
- View IA marks for any semester (Read-only)

## 🏗 Project Structure

### 📌 Backend (`student-management-system-backend/`)

```
├── src/
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
│   │   ├── uploads/ (For storing project files)
│   ├── app.js
│   ├── server.js
├── package.json
├── .env
├── .gitignore
├── README.md
```

### 📌 Frontend (`student-management-system-frontend/`)

```
├── src/
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
├── package.json
├── .env
├── vite.config.js
├── .gitignore
├── README.md
```

## 📡 API Endpoints

### Authentication (`/api/auth/`)

| Method | Route       | Description   |
| ------ | ----------- | ------------- |
| POST   | `/login`    | User login    |
| POST   | `/register` | Register user |

### Admin Routes (`/api/admin/`)

| Method | Route             | Description            |
| ------ | ----------------- | ---------------------- |
| POST   | `/create-student` | Create a new student   |
| POST   | `/create-faculty` | Create a new faculty   |
| GET    | `/students`       | Get all students       |
| DELETE | `/student/:id`    | Delete/suspend student |

### Faculty Routes (`/api/faculty/`)

| Method | Route                | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | `/authorize-student` | Approve a student registration |
| POST   | `/upload-ia-marks`   | Upload IA marks via Excel      |
| GET    | `/students/:usn`     | Get student details by USN     |

### Student Routes (`/api/student/`)

| Method | Route                  | Description                    |
| ------ | ---------------------- | ------------------------------ |
| POST   | `/upload-mooc`         | Upload MOOC course details     |
| POST   | `/upload-mini-project` | Upload Mini Project details    |
| GET    | `/ia-marks/:semester`  | View IA Marks for any semester |

## 🛠 Installation & Setup

### 🔹 Backend Setup

```sh
cd student-management-system-backend
npm install
npm run dev
```

### 🔹 Frontend Setup

```sh
cd student-management-system-frontend
npm install
npm run dev
```

## 📄 Environment Variables

Create a `.env` file in both the backend and frontend directories:

### Backend `.env`

```
PORT=5000
MONGO_URI=mongodb+srv://your_mongo_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:5000/api
```

## 📜 License

This project is licensed under the **MIT License**.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Contact

For inquiries, reach out via [email](mailto\:monu56410000@gmail.com).

---

Made with ❤️ by Monu Kumar & Team 🚀



