const { OAuth2Client } = require('google-auth-library');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const client = new OAuth2Client('dummy', 'dummy', 'http://localhost:8000/api/google/auth/callback');
console.log(client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
  state: 'dummy_state'
}));
