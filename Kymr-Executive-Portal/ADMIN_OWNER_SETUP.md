# KymrStudio Executive Portal: Initial Owner Setup Guide

The Executive Portal (`/admin`) is strictly private. Authentication (Google Sign-In or Email/Password via Firebase) is entirely separate from Authorization (KymrStudio permissions). 

**By design, the portal does NOT allow the first user to automatically become the OWNER.** There is no way to create an OWNER account from the browser.

To provision the initial OWNER account, you must manually create the authorization record directly in the Firebase Console.

### Setup Instructions

1. **Authenticate in the Portal (Optional but Recommended)**
   - Go to `https://kymrstudio.com/admin` (or `http://localhost:8000/admin` locally).
   - Sign in with your desired Google Account or via Email/Password.
   - You will see an **ACCESS DENIED** screen. This is expected because you are authenticated but not yet authorized.

2. **Obtain your Firebase UID**
   - Log into the [Firebase Console](https://console.firebase.google.com/).
   - Select your project.
   - Go to **Authentication** -> **Users**.
   - Find your email address in the list and copy the exact **User UID** string.

3. **Create the Authorization Record in Firestore**
   - In the Firebase Console, go to **Firestore Database**.
   - If the `users` collection does not exist, click **Start collection** and name it exactly: `users`
   - For the **Document ID**, paste your exact **User UID** (do not use Auto-ID).
   - Add the following exact fields to this document:
     - Field: `email` | Type: `string` | Value: `your.email@example.com`
     - Field: `role` | Type: `string` | Value: `OWNER`
     - Field: `createdAt` | Type: `timestamp` | Value: *(select current date and time)*

4. **Verify Access**
   - Return to the Executive Portal and refresh the page.
   - You will now bypass the ACCESS DENIED screen and enter the KymrStudio Executive Portal as the OWNER.

### Managing Future Team Members
Once you are the OWNER, you do not need to repeat this manual process for your team. You can provision additional `ADMIN` or `MEMBER` roles directly from within the Executive Portal interface (under Team/Settings, once implemented) because the Firestore security rules grant you the authority to create and manage other users.

### Security Notes
- **Unauthorized Accounts**: Any Google account can authenticate, but without a matching document in the `users` collection, they will only ever see the ACCESS DENIED screen.
- **Revoking Access**: To revoke someone's access, either delete their document in the `users` collection or change their role.
- **Rule Protection**: Client browsers are strictly forbidden from writing `OWNER` roles to Firestore. Only you, via the Firebase Console, can establish the initial OWNER.
