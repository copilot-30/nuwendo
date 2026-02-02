import { google } from 'googleapis';
import dotenv from 'dotenv';
import pool from '../config/database.js';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

/**
 * Get stored access token from database
 */
const getStoredTokens = async () => {
  try {
    const result = await pool.query(
      `SELECT setting_key, setting_value 
       FROM system_settings 
       WHERE setting_key IN ('google_access_token', 'google_refresh_token')`
    );
    
    const tokens = {};
    result.rows.forEach(row => {
      if (row.setting_key === 'google_access_token') {
        tokens.access_token = row.setting_value;
      } else if (row.setting_key === 'google_refresh_token') {
        tokens.refresh_token = row.setting_value;
      }
    });
    
    return tokens;
  } catch (error) {
    console.error('Error getting stored tokens:', error);
    return null;
  }
};

/**
 * Create a Google Calendar event with Meet link
 * @param {Object} appointmentDetails - Details of the appointment
 * @returns {Promise<{meetLink: string, eventId: string}>}
 */
export const createGoogleMeetLink = async (appointmentDetails) => {
  try {
    // Get stored tokens
    const tokens = await getStoredTokens();
    
    if (!tokens || !tokens.access_token) {
      throw new Error('Google OAuth not configured. Please authorize the application first by visiting /api/oauth/google/authorize');
    }

    // Set credentials
    oauth2Client.setCredentials(tokens);
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const { summary, description, startDateTime, durationMinutes, attendeeEmail } = appointmentDetails;
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
    
    const event = {
      summary: summary || 'Nuwendo Clinic Consultation',
      description: description || 'Video consultation appointment',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Manila',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Manila',
      },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
      conferenceData: {
        createRequest: {
          requestId: `nuwendo-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };
    
    console.log('Creating Google Calendar event...');
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });
    
    const meetLink = response.data.conferenceData?.entryPoints?.find(
      entry => entry.entryPointType === 'video'
    )?.uri || response.data.hangoutLink;
    
    console.log('✅ Google Meet link created:', meetLink);
    
    return {
      meetLink,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      message: 'Real Google Calendar event created with Meet link'
    };
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw new Error(`Failed to create Google Meet link: ${error.message}`);
  }
};

/**
 * Create a full Google Calendar event with Meet link (requires OAuth token)
 * This function would be used if you implement full OAuth flow
 */
export const createCalendarEventWithMeet = async (accessToken, appointmentDetails) => {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const { summary, description, startDateTime, durationMinutes, attendeeEmail } = appointmentDetails;
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
    
    const event = {
      summary,
      description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Manila',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Manila',
      },
      attendees: [
        { email: attendeeEmail }
      ],
      conferenceData: {
        createRequest: {
          requestId: `nuwendo-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });
    
    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || 
                     response.data.hangoutLink;
    
    return {
      meetLink,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

/**
 * Get OAuth2 authorization URL
 * Use this to redirect admin to Google for authorization
 */
export const getAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
};

/**
 * Exchange authorization code for tokens
 */
export const getTokenFromCode = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export default {
  createGoogleMeetLink,
  createCalendarEventWithMeet,
  getAuthUrl,
  getTokenFromCode
};
