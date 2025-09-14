☀️ SolarPredict: AI-Powered Solar Energy Forecasting

SolarPredict is a smart, full-stack web application that uses AI and real-time data to predict solar power generation.
It helps researchers, engineers, and solar companies plan energy usage, optimize solar panels, and improve efficiency.

🌍 With the growing need for clean energy, SolarPredict makes solar power predictable, reliable, and accessible.

💡 Because every unit of clean energy matters.

👥 Team Information

Team Name: The Honoured Ones
College: Nirma University

Contributors

👨‍💻 Darshan Buddhdev – GitHub: darshanNhb

👨‍💻 Param Chhag

👩‍💻 Yashvi Hingrajiya

👩‍💻 Vasavi Chaudhary

🌟 Overview

SolarPredict gives users the ability to:

📍 Enter their location, tilt, and azimuth of solar panels.

🌤️ Use real-time weather and solar geometry.

⚡ Get instant predictions of solar power output (kW).

📊 Store and view prediction history in a personal dashboard.

🔑 Access through a secure login & signup system.

🎨 Enjoy a modern, clean, and mobile-friendly design with animations.

🎨 Design Philosophy

We followed a clean and minimal UI/UX approach:

Colors: White (primary), Black (secondary), Orange (tertiary).

Contextual colors (Green, Red, Blue) for status, inputs, outputs, and alerts.

Fully mobile-responsive design with smooth Framer Motion animations.

Sidebars and Navbars for easy navigation.

🎨 A balance between simplicity and visual richness (glass morphism / minimal shadows).

🏗️ System Architecture

SolarPredict is designed with modern full-stack principles ensuring scalability, security, and performance.

⚛️ Frontend

Vite + React 19 + TypeScript – fast, reliable, and strongly typed.

React Router v7 – smooth navigation.

Tailwind CSS v4 – utility-first styling.

Shadcn UI – accessible, pre-built UI components.

Framer Motion – animations (fade in/out, slide transitions, UI effects).

Three.js – 3D visualizations for landing page and dashboards.

🔙 Backend & Database

Convex – serverless backend + real-time database.

Convex Auth – built-in authentication system.

CRUD operations for predictions, users, and dashboards.

Handles business logic for:

Storing user predictions.

Fetching past history.

Authorization checks.

🧠 AI/ML Model

Trained using scikit-learn / LightGBM.

Inputs: Weather conditions, solar geometry (tilt, azimuth, irradiance).

Output: Predicted solar power (kW).

Integrated with backend via Convex Actions.

🔐 Authentication

Built with Convex Auth.

Supports email OTP and anonymous login (expandable for future).

Authentication is fully integrated:

Frontend → uses useAuth hook.

Backend → uses getCurrentUser() in convex functions.

Protected routes for:

Dashboard

Prediction History

Visualizations

👉 If a user is not logged in, they are redirected to /auth.

⚡ Features
User Features

📝 Prediction Form – enter latitude, longitude, tilt, azimuth.

🌤️ Weather Integration – fetches real-time weather data.

⚡ AI Prediction – calculates power output instantly.

📊 Prediction History – saved in Convex DB, view anytime.

📈 Visualization Dashboard – charts & graphs for better insights.

🔑 Authentication – signup, login, logout with Convex Auth.

📱 Responsive Design – works on desktop, tablet, and mobile.

Admin/Backend Features

👤 Manage users.

💾 Store prediction logs.

✅ Authorization checks on every query/mutation.

🔒 Secure database schema with type safety.

🛠️ Tech Stack
Core Infrastructure

Convex – serverless backend + database.

Convex Auth – authentication system.

pnpm – package manager.

Frontend

React 19 + TypeScript

Vite (fast builds)

React Router v7 (navigation)

Tailwind CSS v4 + Shadcn UI (styling)

Framer Motion (animations)

Three.js (3D visuals)

Backend

Convex Functions (queries, mutations, actions).

Secure CRUD operations for users, predictions, and history.

AI/ML

scikit-learn / LightGBM model trained on solar datasets.

Integrated with Convex backend.

🚀 Deployment

Project runs in cloud environment + Convex sandbox.

Uses environment variables for safe configuration:

CONVEX_DEPLOYMENT

VITE_CONVEX_URL

JWKS, JWT_PRIVATE_KEY, SITE_URL

🔮 Future Scope

🌍 Expand dataset for global solar prediction.

🤖 Use Deep Learning models for higher accuracy.

🏠 Smart grid integration for home energy optimization.

📱 Mobile app version with push notifications.

☁️ IoT sensor integration for live panel monitoring.

📊 Advanced analytics dashboards for researchers.

🏆 Why SolarPredict Matters

Helps predict and optimize solar energy production.

Supports renewable energy adoption worldwide.

Bridges AI + Environment + Engineering.

Designed to be scalable, secure, and user-friendly.

💡 SolarPredict isn’t just an app – it’s a step toward a sustainable future.

📊 Architecture Diagram (Data Flow)
 [Frontend UI]  <-->  [Convex Backend]  <-->  [AI Model]
       |                     |                    |
   User Input           Auth, CRUD            Predict Power
       |                     |                    |
       v                     v                    v
   React + TS         Convex Database        kW Output JSON<img width="1893" height="909" alt="Screenshot 2025-09-14 083528" src="https://github.com/user-attachments/assets/4ebe7b13-5c32-422e-8de2-9278342bc81a" />


<img width="1895" height="912" alt="Screenshot 2025-09-14 083212" src="https://github.com/user-attachments/assets/b0692e81-f0c1-4daa-98df-6da56adef9d9" />
<img width="1897" height="915" alt="Screenshot 2025-09-14 083224" src="https://github.com/user-attachments/assets/f23a190b-2daa-4cbc-897f-dd39cced9c77" />
<img width="1905" height="913" alt="Screenshot 2025-09-14 083324" src="https://github.com/user-attachments/assets/2b6c8d07-7ed2-4a69-82d9-a7bdf6fbedcd" />
<img width="1894" height="908" alt="Screenshot 2025-09-14 083335" src="https://github.com/user-attachments/assets/327d6059-73f3-4066-a07a-21210cc03365" />
<img width="1899" height="912" alt="Screenshot 2025-09-14 083346" src="https://github.com/user-attachments/assets/8e3ba5e3-06b6-4c7d-a2b6-e9a2a910e47e" />
<img width="1899" height="911" alt="Screenshot 2025-09-14 083439" src="https://github.com/user-attachments/assets/d296bc57-46a7-4794-879d-672f1d81978f" />
<img width="1898" height="906" alt="Screenshot 2025-09-14 083451" src="https://github.com/user-attachments/assets/6b57f551-f94c-40c3-b416-ce893e8082da" />
<img width="1897" height="909" alt="Screenshot 2025-09-14 083502" src="https://github.com/user-attachments/assets/a4cba18d-c486-402e-8d1d-38e4567aa665" />
<img width="1901" height="902" alt="Screenshot 2025-09-14 083510" src="https://github.com/user-attachments/assets/9eb19958-f677-4cbf-b053-4db1cbd14807" />










