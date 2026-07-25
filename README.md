# DentPulse AI

DentPulse AI is a comprehensive, full-stack application designed to serve as a modern clinical management and AI-powered decision support system for dental professionals. The platform manages patient records, prescriptions, treatment planning, and predictive clinical healing analysis.

## 🛠️ Technology Stack Overview

### Frontend & Mobile Application
The client application is built as a universal app (targeting Web, iOS, and Android) using a modern React Native architecture.
- **Framework:** [React Native](https://reactnative.dev/) (v0.81) / [Expo](https://expo.dev/)
- **Language:** TypeScript (`.tsx`)
- **Navigation:** `@react-navigation/bottom-tabs`, `native-stack`, and `drawer`
- **UI & Icons:** Custom glassmorphism UI components, `lucide-react-native` for vector icons
- **Visualizations:** `react-native-svg` and `victory-native` for clinical recovery charts
- **State Management:** React Context API

### Backend API Server
The backend is a high-performance, asynchronous REST API serving clinical data and AI model predictions.
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Server:** Uvicorn (ASGI)
- **Data Validation:** Pydantic
- **Authentication:** JWT (JSON Web Tokens) with `python-jose`, passwords hashed via `passlib[bcrypt]`
- **CORS:** Built-in FastAPI middleware for cross-origin management

### Database
- **Engine:** SQLite (using `aiosqlite` for asynchronous DB access)
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) (v2.0)
- **Migrations:** [Alembic](https://alembic.sqlalchemy.org/)

### Artificial Intelligence / Machine Learning
- **Libraries:** `scikit-learn` (v1.3+), `numpy`
- **Models:** Support Vector Machines (SVM) for predictive clinical healing risk analysis (`train_svm.py`)

### Testing & Automation
A robust suite of automated End-to-End (E2E) testing ensures application stability.
- **Web Automation:** Selenium WebDriver using Mocha and Chai
- **Mobile Automation:** Appium (via WebdriverIO)
- **Reporting:** Custom Node.js scripts using `exceljs` and `mochawesome` to auto-generate and sync results directly to Excel tracking sheets (`Selenium_TestCases.xlsx`).

---

## 🚀 Running the Project Locally

### 1. Start the Backend API (Python)
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Start the Frontend App (Expo)
```bash
npm install
npm run web     # To run in the browser
# OR
npm run android # To launch in Android Emulator
```

### 3. Run Automated Tests (Selenium)
```bash
cd selenium-tests
npm install
npm test
node bulk-update-excel.js # Syncs test results to the Excel tracking sheet
```
