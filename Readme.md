# 🎓 PathGuider AI

An AI-powered **Student Support Platform** developed using the **MERN Stack** and **Generative AI**. The application provides students with instant academic guidance, career assistance, campus support, personalized AI conversations, and secure authentication through a modern web interface.

![React](https://img.shields.io/badge/Frontend-React%20(Vite)-61DAFB)
![Tailwind CSS](https://img.shields.io/badge/CSS-Tailwind-38BDF8)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933)
![Express.js](https://img.shields.io/badge/Framework-Express.js-000000)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![AI](https://img.shields.io/badge/AI-Generative%20AI-blueviolet)
![License](https://img.shields.io/badge/License-Educational-red)

---

## 📌 Features

* 🔐 Secure User Registration & Login
* 🤖 AI-Powered Student Assistant
* 💬 Real-Time AI Chat
* 📝 Personalized Chat History
* 🎓 Academic & Career Guidance
* 🏫 Campus Information Support
* 👨‍🏫 Counselor Connectivity
* 🔒 JWT Authentication & Password Encryption
* 📱 Fully Responsive Interface

---

## 🛠️ Technologies Used

### Frontend
* React (Vite)
* Tailwind CSS
* React Router
* Axios

### Backend
* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt.js

### AI Integration
* Grok API *(Supports OpenAI / Gemini / OpenRouter)*

### Tools
* VS Code
* Git
* GitHub
* Postman

---

## ⚙️ Prerequisites

* Node.js (v18 or above)
* MongoDB
* npm
* Git

---

## ▶️ How to Run

### Clone Repository

```bash
git clone https://github.com/rachit-bhardwaj/PathGuider-AI.git
cd PathGuider-AI
```

### Install Dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd server
npm install
```

### Create Environment Variables

Create a `.env` file inside the server folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

AI_API_KEY=your_api_key
AI_API_URL=your_ai_endpoint
```

### Start Backend

```bash
npm run dev
```

### Start Frontend

```bash
npm run dev
```

---

## 🗄️ Database

### Database

`PathGuiderAI`

Collections

* Users
* Chats
* Messages
* Counselors *(Optional)*

---

## 📂 Project Structure

### Frontend

* Authentication Pages
  * Login
  * Register
* AI Chat Interface
* Chat History

### Backend

* Authentication APIs
* AI Chat APIs
* User Management
* Chat History Management
* Middleware
* Database Models

---

## 🔐 Authentication

* JWT Authentication
* Password Hashing using bcrypt
* Protected Routes
* Secure API Access

---

## 📸 Project Screenshots

<table align="center">
<tr>
<td align="center">
<img src="assets/Home 1.png" width="400"><br>
<b>Home Page</b>
</td>

<td align="center">
<img src="assets/home 3.png" width="400"><br>
<b>3 Simple Steps</b>
</td>
</tr>

<tr>
<td align="center">
<img src="assets/home 4.png" width="400"><br>
<b>Counselor Profile</b>
</td>

<td align="center">
<img src="assets/home 5.png" width="400"><br>
<b>Blog Section</b>
</td>
</tr>

<tr>
<td align="center">
<img src="assets/sign up.png" width="400"><br>
<b>Registration Page</b>
</td>

<td align="center">
<img src="assets/user book appointment.png" width="400"><br>
<b>User Book Appointment</b>
</td>
</tr>

<tr>
<td align="center">
<img src="assets/user msg to counselor.png" width="400"><br>
<b>Chat with counselor</b>
</td>

<td align="center">
<img src="assets/user send msg.png" width="400"><br>
<b>Send Query to Counselor</b>
</td>
</tr>

<tr>
<td align="center">
<img src="assets/counselor profile.png" width="400"><br>
<b>Counselor Profile</b>
</td>

<td align="center">
<img src="assets/counselor recive appointment.png" width="400"><br>
<b>Counselor Appointment List</b>
</td>
</tr>

<tr>
<td align="center">
<img src="assets/counselor slot.png" width="400"><br>
<b>Counselor Time-Slots</b>
</td>

<td align="center">
<img src="assets/admin.png" width="400"><br>
<b>Admin Dashboard 1</b>
</td>
</tr>

<tr>
<td align="center">
<img src="assets/admin 2.png" width="400"><br>
<b>Admin Dashboard 2</b>
</td>

<td align="center">
<img src="assets/admin 3.png" width="400"><br>
<b>Admin Approve Counselor</b>
</td>
</tr>

</table>

---

## 🚀 Future Enhancements

* 🎙️ Voice-Based AI Assistant
* 🌍 Multilingual Support
* 📄 Resume & Document Analysis
* 📊 Student Analytics Dashboard
* ☁️ Cloud Deployment
* 📱 Android & iOS Applications
* 🧠 Retrieval-Augmented Generation (RAG)
* 🎯 Personalized Career Recommendations

---

## 👨‍💻 Developer

Built by **Rachit Bhardwaj**  
**Computer Science Engineering Student | Full-Stack MERN Developer**

---

## 📄 License

This project is developed for educational, research, and learning purposes.