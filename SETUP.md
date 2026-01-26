# Wanderlist Setup Guide

This guide will help you set up Wanderlist with authentication and database integration on Netlify with Neon PostgreSQL.

## Prerequisites

1. A Netlify account
2. A Neon PostgreSQL database account (free tier available)
3. Node.js installed locally (for testing)

## Step 1: Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech) and sign up/login
2. Create a new project
3. Copy your connection string (it will look like: `postgresql://user:password@host/database?sslmode=require`)
4. Run the SQL schema from `database/schema.sql` in your Neon SQL editor:
   - Go to your Neon project dashboard
   - Click on "SQL Editor"
   - Copy and paste the contents of `database/schema.sql`
   - Execute the script

## Step 2: Set Up Netlify

1. **Install Netlify CLI** (optional, for local testing):
   ```bash
   npm install -g netlify-cli
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Deploy to Netlify**:
   - Option A: Via Netlify Dashboard
     1. Go to [Netlify Dashboard](https://app.netlify.com)
     2. Click "Add new site" → "Import an existing project"
     3. Connect your Git repository or drag and drop your project folder
     4. Set build command: (leave empty or `npm install`)
     5. Set publish directory: `.` (root directory)
   
   - Option B: Via Netlify CLI
     ```bash
     netlify login
     netlify init
     netlify deploy --prod
     ```

4. **Set Environment Variables**:
   - Go to your Netlify site dashboard
   - Navigate to Site settings → Environment variables
   - Add a new variable:
     - Key: `DATABASE_URL`
     - Value: Your Neon connection string from Step 1

## Step 3: Test Locally (Optional)

1. Create a `.env` file in the root directory:
   ```
   DATABASE_URL=your_neon_connection_string_here
   ```

2. Install Netlify CLI and run:
   ```bash
   netlify dev
   ```

3. Open `http://localhost:8888` in your browser

## Step 4: Verify Setup

1. Visit your deployed Netlify site
2. You should see the login page
3. Create a new account
4. After login, you should see the main app
5. Try adding a location - it should save to the database

## File Structure

```
Wanderlist/
├── database/
│   └── schema.sql              # Database schema
├── netlify/
│   └── functions/
│       ├── utils/
│       │   ├── db.js          # Database connection utility
│       │   └── auth.js         # Authentication utilities
│       ├── register.js         # User registration endpoint
│       ├── login.js            # User login endpoint
│       ├── forgot-password.js  # Password reset request
│       ├── reset-password.js   # Password reset confirmation
│       └── locations.js        # Locations CRUD endpoints
├── public/
│   └── logo.png
├── index.html                  # Main app (requires auth)
├── login.html                  # Login page
├── register.html               # Registration page
├── auth.js                     # Authentication frontend logic
├── script.js                   # Main app logic (API-integrated)
├── styles.css                  # Styles
├── package.json                # Dependencies
├── netlify.toml                # Netlify configuration
└── README.md                   # Project documentation
```

## API Endpoints

All endpoints are available at `/.netlify/functions/{function-name}`:

- `POST /.netlify/functions/register` - Register new user
- `POST /.netlify/functions/login` - Login user
- `POST /.netlify/functions/forgot-password` - Request password reset
- `POST /.netlify/functions/reset-password` - Reset password with token
- `GET /.netlify/functions/locations` - Get all locations (requires auth)
- `POST /.netlify/functions/locations` - Create location (requires auth)
- `PUT /.netlify/functions/locations` - Update location (requires auth)
- `DELETE /.netlify/functions/locations` - Delete location (requires auth)

## Security Notes

1. **Password Reset Token**: Currently, the reset token is returned in the API response for development. In production, you should:
   - Send the token via email
   - Remove the token from the API response
   - Use a proper email service (SendGrid, AWS SES, etc.)

2. **Token Storage**: Tokens are stored in localStorage. For enhanced security, consider:
   - Using httpOnly cookies
   - Implementing token refresh
   - Adding CSRF protection

3. **Database**: Ensure your Neon database connection string is kept secure and never committed to version control.

## Troubleshooting

### "Unauthorized" errors
- Check that your `DATABASE_URL` environment variable is set correctly in Netlify
- Verify the token is being sent in the Authorization header
- Check browser console for errors

### Database connection errors
- Verify your Neon connection string is correct
- Check that the database schema has been created
- Ensure your Neon project is active

### Functions not working
- Check Netlify function logs in the dashboard
- Verify all dependencies are listed in `package.json`
- Ensure `netlify.toml` is configured correctly

## Support

For issues or questions, check:
- [Netlify Documentation](https://docs.netlify.com/)
- [Neon Documentation](https://neon.tech/docs)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)

