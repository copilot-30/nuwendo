import express from 'express';
import { getAuthUrl, getTokenFromCode } from '../services/googleCalendarService.js';
import pool from '../config/database.js';

const router = express.Router();

// Step 0: Check Google OAuth status
router.get('/google/status', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT setting_key FROM system_settings WHERE setting_key = 'google_refresh_token'`
    );
    const connected = result.rows.length > 0;
    res.json({ connected });
  } catch (error) {
    res.json({ connected: false });
  }
});

// Step 1: Redirect admin to Google for authorization
router.get('/google/authorize', (req, res) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

// Step 2: Google redirects back here with authorization code
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('Authorization code not provided');
    }

    // Exchange code for tokens
    const tokens = await getTokenFromCode(code);
    
    // Store tokens in database (in system_settings table)
    await pool.query(
      `INSERT INTO system_settings (setting_key, setting_value)
       VALUES ('google_access_token', $1)
       ON CONFLICT (setting_key) 
       DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP`,
      [tokens.access_token]
    );

    if (tokens.refresh_token) {
      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value)
         VALUES ('google_refresh_token', $1)
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP`,
        [tokens.refresh_token]
      );
    }

    res.send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1 style="color: #4CAF50;">✅ Authorization Successful!</h1>
          <p>Google Calendar API has been authorized.</p>
          <p>You can now close this window and return to the admin panel.</p>
          <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #2c4d5c; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Close Window
          </button>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1 style="color: #f44336;">❌ Authorization Failed</h1>
          <p>${error.message}</p>
          <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Close Window
          </button>
        </body>
      </html>
    `);
  }
});

export default router;
