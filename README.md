# Global CRM

Global CRM is a full-stack customer relationship management application for
managing customers, companies, email templates, invoices, and outbound email
from one dashboard. It includes authentication, Google sign-in support,
document OCR, PDF invoice generation, and light/dark theme support.

## Features

- User registration, login, logout, and Google authentication
- Customer and company management
- Customer statistics and dashboard summaries
- Reusable email templates with rich-text editing
- Bulk email sending
- Invoice upload, OCR analysis, preview, and PDF generation
- Custom invoice templates
- Cloudinary signature generation for client-side uploads
- Protected API routes with cookie-based sessions and CORS controls

## Tech stack

### Client

- React 19 and React Router
- Create React App
- Tailwind CSS/PostCSS
- Axios and Fetch API
- React PDF, PDF.js, and jsPDF
- TipTap rich-text editor

### Server

- Node.js and Express
- MongoDB with Mongoose
- Passport and Google OAuth
- Cookie sessions and JWT
- Multer for uploads
- Tesseract.js, Mindee, and Google Document AI integrations
- Nodemailer for email delivery
- Vercel-compatible serverless deployment

## Project structure

```text
GLOBAL-CRM/
├── client/                 # React frontend
│   ├── public/
│   └── src/
├── server/                 # Express API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB database (local or MongoDB Atlas)
- API credentials for any optional integrations you enable

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/thisaldil/GLOBAL-CRM.git
cd GLOBAL-CRM
```

### 2. Configure the server

```bash
cd server
npm install
copy .env.example .env
```

Update `server/.env` with your MongoDB connection string and the credentials
for the integrations you plan to use.

### 3. Configure the client

```bash
cd ..\client
npm install
copy .env.example .env
```

Set `REACT_APP_API_URL` to the URL where the API is available. For local
development, use `http://localhost:5000`.

### 4. Run the client

```bash
npm start
```

The React development server runs at `http://localhost:3000`.

### 5. Run the API

The server exports an Express app for Vercel. For a local HTTP server, start
the app with a serverless-compatible adapter or add a local `app.listen`
entrypoint to your development workflow. The API is configured to use port
`5000` in the provided environment example.

## Environment variables

### Server

Copy `server/.env.example` to `server/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `URI` | Yes | MongoDB connection string |
| `NODE_ENV` | Yes | Environment name, such as `development` or `production` |
| `PORT` | Local | API port; the example uses `5000` |
| `FRONTEND_URL` | Yes | Allowed frontend origin |
| `JWT_SECRET` | Yes | Secret used for JWT signing |
| `SESSION_SECRET` | Yes | Secret used to sign session cookies |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Optional | Google OAuth callback URL |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary signing secret |
| `MINDEE_API_KEY` | Optional | Mindee document extraction key |
| `EMAIL_USER` | Optional | SMTP account username |
| `EMAIL_PASS` | Optional | SMTP account password |

### Client

Copy `client/.env.example` to `client/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `REACT_APP_API_URL` | Yes | Base URL of the Express API |
| `REACT_APP_GOOGLE_CLIENT_ID` | Optional | Google sign-in client ID |
| `REACT_APP_MINDEE_API_KEY` | Optional | Mindee client integration key |
| `REACT_APP_CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name |
| `REACT_APP_CLOUDINARY_UPLOAD_PRESET` | Optional | Cloudinary unsigned upload preset |

Never commit `.env` files or private API keys.

## API routes

The API is protected by authentication by default. Authentication routes are
available without an existing session where applicable.

| Prefix | Endpoints | Purpose |
| --- | --- | --- |
| `/auth` | `GET /me`, `POST /register`, `POST /login`, `POST /logout` | Authentication and session management |
| `/auth` | `GET /google`, `POST /google/callback`, `POST /google/register` | Google authentication |
| `/customers` | `GET /`, `GET /stats`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` | Customer management |
| `/company` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` | Company management |
| `/email-templates` | `GET /`, `GET /count`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` | Email template management |
| `/email` | `POST /send-bulk` | Send bulk email |
| `/template` | `POST /createTemplate`, `GET /getTemplates/:userId`, `GET /getTemplateById/:id`, `PUT /updateTemplate/:id`, `DELETE /deleteTemplate/:id` | Invoice template management |
| `/ocr` | `POST /analyze` | Analyze an uploaded document; send the file as `ticket` |
| `/user` | `GET /getUserDetails/:userId` | Retrieve user details |
| `/generate-signature` | `POST /` | Generate a Cloudinary upload signature |
| `/` | `GET /` | API health check |

Example health check:

```bash
curl http://localhost:5000/
```

## Deployment

### Client

Build the production frontend from the `client` directory:

```bash
npm run build
```

Deploy the generated `client/build` directory with a static hosting provider
such as Vercel or Netlify. Set the client environment variables in the
provider dashboard.

### Server

The server includes `server/vercel.json` and exports the Express app from
`server/server.js` for Vercel deployment. Configure the server environment
variables in the hosting provider before deploying. Set `FRONTEND_URL` to the
exact deployed frontend origin.

## Testing

Run the client test suite from the `client` directory:

```bash
npm test
```

The server currently does not define automated tests.

## License

This project is licensed under the MIT License.
