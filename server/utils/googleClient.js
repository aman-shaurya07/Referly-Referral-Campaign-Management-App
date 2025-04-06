const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID_1,
  process.env.GOOGLE_CLIENT_SECRET_1,
  process.env.GOOGLE_REDIRECT_URI_1
);

module.exports = oauth2Client;
