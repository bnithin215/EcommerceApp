# Firebase Setup Guide

This guide will help you configure Firebase for the Ecommerce App.

## Prerequisites

1. A Firebase account (create one at [firebase.google.com](https://firebase.google.com))
2. A Firebase project created in the Firebase Console

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Get Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "Ecommerce App")
6. Copy the configuration values

## Step 3: Create .env File

1. In the root directory of this project, create a file named `.env`
2. Add the following content with your Firebase configuration:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Optional: Use Firebase Emulators for local development
REACT_APP_USE_FIREBASE_EMULATOR=false
```

**Important:** Replace all the placeholder values with your actual Firebase configuration values.

## Step 4: Enable Firebase Services

### Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" authentication method
4. Save the changes

### Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in "test mode" for development (you can update security rules later)
4. Choose a location for your database
5. Click "Enable"

### Enable Storage

1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Start in "test mode" for development
4. Choose a location for your storage
5. Click "Done"

## Step 5: Set Up Firestore Security Rules (Optional)

For production, update your Firestore security rules. For development, you can use test mode.

Example rules for development:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2024, 12, 31);
    }
  }
}
```

## Step 6: Restart Development Server

After creating the `.env` file:

1. Stop your development server (if running)
2. Start it again with `npm start`
3. Check the browser console - you should see "Firebase initialized successfully"

## Troubleshooting

### Error: "Firebase Auth is not properly initialized"

- Check that your `.env` file is in the root directory (same level as `package.json`)
- Verify all environment variables start with `REACT_APP_`
- Make sure there are no spaces around the `=` sign
- Restart your development server after creating/modifying `.env`

### Error: "Missing Firebase configuration fields"

- Verify all 6 Firebase configuration variables are present in `.env`
- Check that values are not empty
- Ensure no quotes are around the values in `.env`

### App runs but authentication doesn't work

- Check Firebase Console > Authentication > Sign-in method - ensure Email/Password is enabled
- Verify your Firebase configuration values are correct
- Check browser console for detailed error messages

## Demo Mode (Without Firebase)

If you don't configure Firebase, the app will run in **demo mode**:
- ✅ Products can be viewed (using fallback data from `products.json`)
- ❌ User authentication will not work
- ❌ Shopping cart will not persist
- ❌ Orders cannot be placed

This is useful for:
- Testing the UI
- Development without Firebase
- Demonstration purposes

## Need Help?

1. Check the browser console for detailed error messages
2. Verify your Firebase project is active in Firebase Console
3. Ensure all services (Auth, Firestore, Storage) are enabled
4. Check Firebase documentation: https://firebase.google.com/docs

## Security Notes

- **Never commit your `.env` file to version control**
- The `.env` file should be in `.gitignore`
- For production, use environment variables provided by your hosting platform
- Update Firestore security rules before deploying to production

