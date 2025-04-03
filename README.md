# ⭐ Referly – Referral Campaign Management App

**Referly** is a full-stack web application that helps businesses run referral-based marketing campaigns, reward users, manage CRM contacts, and gain insights through advanced analytics.

## 🔥 Key Features

- 🧠 AI-generated referral messages (via Google Gemini)
- 💌 Google login for secure authentication
- 🔗 Referral campaign creation and sharing
- 🧾 CRM email uploads via CSV or manual entry
- 📈 Analytics dashboard for campaign performance
- 📬 Email notifications when tasks are completed or rewards are redeemed (via Zapier)
- 🌟 Loyalty-based referral system (dynamic links for top customers)
- 🧑‍🤝‍🧑 Customer management and classification
- ✅ Task completion and reward redemption tracking

---

## ⚙️ Tech Stack

**Frontend**:
- React
- Tailwind CSS
- shadcn/ui
- Axios
- React Router DOM

**Backend**:
- Node.js
- Express.js
- MongoDB
- Mongoose
- Google OAuth2
- Nodemailer (email sending)
- Google Gemini Pro API (for AI content)

---

## 🛠️ Setup Instructions

### 🔐 Environment Variables (Server Side)

Create a `.env` file inside the `server/` directory and add:

```env
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password_or_email_password
GEMINI_API_KEY=your_google_gemini_api_key
ZAPIER_TASK_COMPLETED_URL=your_ZAPIER_TASK_COMPLETED_URL
ZAPIER_REWARD_REDEEMED_URL=your_ZAPIER_REWARD_REDEEMED_URL
```

EMAIL_USER and EMAIL_PASS are used to send dynamic emails to loyal customers, Zapier notifications, for sending rewards to users



## ⚡ Zapier Integration (Optional, but Recommended)

This project supports optional **Zapier integration** to send **email notifications** when:
1. A user **completes a referral task**
2. A user **redeems a reward**

To enable this feature, follow the steps below.

---

### 🔧 Step-by-Step Guide to Create Zapier Zaps

#### 1. Zap for Task Completion Notification

This Zap will trigger an email when someone **completes a referral task**.

- Go to [Zapier](https://zapier.com) and **create a new Zap**
- **Trigger**:
  - App: `Webhooks by Zapier`
  - Event: `Catch Hook`
  - Continue and **copy the webhook URL**
- **Action**:
  - App: `Gmail` (or any other email service)
  - Event: `Send Email`
  - Customize the email:
    - **To**: your business email
    - **Subject**: `Referral Task Completed!`
    - **Body**: Include relevant info like user email, campaign title, etc.
- **Test the Zap** and **Publish**
- Copy the webhook URL and add it to your `.env` file:

```env
ZAPIER_TASK_COMPLETED_URL=https://hooks.zapier.com/hooks/catch/xxxxx/task-completed/
```


#### 2. Zap for Reward Redemption Notification

This Zap will trigger an email when someone redeems a reward.

- **Create a new Zap following the same steps.**
- **Trigger**:
  - App: `Webhooks by Zapier`
  - Event: `Catch Hook`
  - Continue and **copy the webhook URL**
- **Action**:
  - App: `Gmail` (or any other email service)
  - Event: `Send Email`
  - Customize the email:
    - **To**: your business email
    - **Subject**: `Referral Task Completed!`   
    - **Body**: Include info like reward code, customer name, etc..
- **Test the Zap** and **Publish**
- Copy the webhook URL and add it to your `.env` file:

```env
ZAPIER_REWARD_REDEEMED_URL=https://hooks.zapier.com/hooks/catch/xxxxx/reward-redeemed/
```









## Running the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/aman-shaurya07/Referly-Referral-Campaign-Management-App.git
cd referral-mvp
```

### 2. Install Dependencies
Server
```bash
cd server
npm install
```

Client
```bash
cd client
npm install
```



### 3. Run the App
Server
```bash
# Terminal 1
cd server
npm run dev
```

Client
```bash
# Terminal 2
cd client
npm start
```

### 4. Go to url:
```bash
http://localhost:3000/
```




## How to Use

- Login with Google to access the dashboard.
- Create a campaign with task and reward details.
- Share referral links with users.
- Users can complete tasks and submit responses.
- Loyal customers are identified automatically.
- Admins can email dynamic referral links to loyal users.
- Analytics show CRM conversions, top referrers, and performance.
- Zapier sends emails when tasks are completed or rewards are redeemed.




## ⚡ Zapier Integration

- Triggered when a task is completed or a reward is redeemed.
- Uses webhooks to send formatted Gmail notifications to the business owner.

## 🙌 Acknowledgements

- **Google Gemini API** for AI-powered email/message generation.
- **Zapier** for automation and external email alerts.
- **Tailwind CSS** and **shadcn/ui** for beautiful UI components.
- **MongoDB Atlas** for cloud database storage.

## 📬 Contact

For feedback or questions, feel free to reach out:  
**amanshaurya25@gmail.com**

---

**Made with ❤️ by Aman – Empowering businesses through referrals.**
