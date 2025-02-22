CBT-ED Chatbot - A Conversational Agent for Cognitive Behavioral Therapy
🌱 Project Overview
Eating disorders and disordered eating behaviors are prevalent among adolescents and young adults, particularly females and athletes. Cognitive Behavioral Therapy (CBT) is a common intervention aimed at recognizing and changing negative thoughts and behaviors.

This project explores the design of a conversational agent to promote a healthy body image using CBT-based techniques. The chatbot guides users through structured conversations, thought exercises, and self-reflection, complementing professional therapy.

This project is part of a Master’s thesis titled:
📝 “Designing a Conversational Agent for Young Adults at Risk of Eating Disorders Based on Cognitive Behavioral Therapy”

🛠 Tech Stack
Frontend: React.js (hosted on Netlify)
Backend: Express.js (hosted on Render)
Database: Firebase Firestore
NLP Model: OpenAI GPT-3.5 Turbo (via API)
🌟 Key Features
🔹 Challenge Negative Thoughts - Helps users reframe distorted thoughts through guided CBT exercises.
🔹 Track My Mood - Provides a structured way to record mood, triggers, and coping mechanisms.
🔹 Log My Behavior - Encourages self-awareness by tracking daily activities and emotional impact.
🔹 Get Self-Care Tips - Suggests personalized self-care activities based on user input.

🚀 Getting Started
1️⃣ Clone the Repository
sh
Copy
Edit
git clone https://github.com/Iris-Jiang311/cbt-ed-chatbot.git
cd cbt-ed-chatbot
2️⃣ Install Dependencies
sh
Copy
Edit
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
3️⃣ Set Up Environment Variables
Create a .env file in both the frontend and backend directories.

Frontend (frontend/.env):
ini
Copy
Edit
REACT_APP_API_URL=https://your-backend-url.onrender.com
Backend (backend/.env):
ini
Copy
Edit
OPENAI_API_KEY=your_openai_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
4️⃣ Run the Application
sh
Copy
Edit
# Start backend server
cd backend
npm start

# Start frontend server
cd ../frontend
npm start
The chatbot should now be accessible at http://localhost:3000. 🚀

🔌 API Endpoints
📝 Chatbot Interaction (POST)
Endpoint: /chatbot
Request:

json
Copy
Edit
{
  "message": "I feel like I'm not good enough."
}
Response:

json
Copy
Edit
{
  "response": "It sounds like you're struggling with self-doubt. Let's try to reframe this thought together."
}
📌 Future Enhancements
✅ Improve NLP Understanding using fine-tuned sentiment analysis models
✅ Expand Self-Care Suggestions with personalized AI-driven recommendations
✅ Integrate Voice-based Interaction for a more engaging user experience
✅ Enhance Data Visualization for mood and behavior tracking

🤝 Contributing
Contributions are welcome! Feel free to fork this repository and submit pull requests.

