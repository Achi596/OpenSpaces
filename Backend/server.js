import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { userFeedback } from './feedback.js';
import { requestHelp, helpList } from './helpForm.js';
import { searchSpaces, getSpaces, createSpace, spaceCheckIn} from './spaces.js';
import { secretKey } from './helper.js';
import { availableSpacesFloorId } from './availableSpacesFloorId.js';
import { availableSpacesSpaceId } from './availableSpacesSpaceId.js';
import { uploadImage } from './cdnInterface.js';
import { authUserCreate, authUserDelete, authUserGet, authUserLogin,
  authUserLogout, sendCode, verifyCode } from './auth.js';
import { listFloorplans, getFloorplans,
  floorplansCreate, floorplansEdit} from './floorplans.js';
import { createBooking, removeBooking, listBookingsSpaceId,
  overrideBooking, editBooking, getBookingsWithId, getAllBookingsForUser
} from './bookings.js';
import { createNotification, deleteNotification,
  getNotifications } from './notifications.js';
import { generateStats } from './usageStats.js';
import { ensureTables } from './bootstrap.js';

const app = express();
const port = process.env.BACKEND_PORT || 5000;

ensureTables();

app.use(express.json());

app.use(
  cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class Tokens {
  constructor() {
    this.tokens = [];
  }

  add(username, token) {
    this.tokens.push({
      user: username,
      token: token,
    });
  }

  remove(tokenToRemove) {
    this.tokens = this.tokens.filter(tokenObj =>
      tokenObj.token !== tokenToRemove);
  }

  removeAll() {
    this.tokens = [];
  }

  exists(username) {
    return this.tokens.some(tokenObj => tokenObj.user === username);
  }

  existsByToken(token) {
    return this.tokens.some(tokenObj => {
      if (tokenObj.token === token) {
        try {
          const decoded = jwt.verify(token, secretKey);
          if (decoded.expiryTime && decoded.expiryTime < Date.now() / 1000) {
            return false; // Token expired
          }
          return true; // Token exists and not expired
        } catch {
          return false; // Token verification failed or expired
        }
      }
      return false; // Token not found in tokens array
    });
  }

  getUser(token) {
    for (const tokenObj of this.tokens) {
      if (tokenObj.token === token) {
        return tokenObj.user;
      }
    }
    return null; // Return null if token not found
  }

  getToken(username) {
    for (const tokenObj of this.tokens) {
      if (tokenObj.user === username) {
        return tokenObj.token;
      }
    }
  }
}

export const httpResponses = {
  'The user does not exist': 404,
  'The code does not match': 403,
  'Floorplan references a space that does not exist': 404,
  'The code has expired': 403,
  'The booking does not exist': 403,
  'The user is already verified': 409,
  'terminated account': 401,
  'unverified account': 401,
  'Email must be a UNSW email.': 403,
  'User already exists in the database.': 409,
  'Password does not match': 403,
  'Admin access required for this operation': 403,
  'Invalid token': 498,
  'Invalid search query': 400,
  'Invalid floorplanID': 400,
  'The floorplan does not exist': 404,
  'Space not found': 404,
  'Invalid Name': 400,
  'Pins cannot be empty': 400,
  'Image must be a valid URL to an image': 400,
  'You do not have access to book this space': 403,
  'Space is not available for the selected time slot': 409,
  'Bookings must be within the same day.': 400,
  'Bookings are only allowed from 9am to 9pm on weekdays.': 400,
  'Database error': 500,
  'Invalid date object received': 400,
  'No admin found': 404,
  'CDN Error. Please try again later': 500,
  'File extension is missing from upload': 400,
  'No matching bookings found for the given space': 404,
  'Already checked in': 409,
  'Check-in must be within booking window': 403,
  'No bookings found': 404,
  'Notification not found': 404,
  'Invalid booking window': 400,
  'Booking conflicts with existing booking(s)': 409,
  'This account has been suspended for unsatisfactory attendance, try creating an override request! (～￣(OO)￣)ブ': 403, // eslint-disable-line max-len
  'Rooms are only available to admins and CSE staff, try creating an override request! ヾ(≧▽≦*)o': 403, // eslint-disable-line max-len
};

export const tokens = new Tokens();

app.post('/data/upload', upload.single('image'), async (req, res) => {
  const fileName = req.file.originalname;

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const imageURL = await uploadImage(req.file.buffer, fileName);

    res.json({ imageURL });
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.post('/user/create', async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send('Bad request');
    return;
  }

  try {
    await authUserCreate(req.body);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.post('/user/verify', (req, res) => {
  const username = req.body.username;
  const verificationCode = req.body.verificationCode;

  if (!username || !verificationCode) {
    res.status(400).send('Bad request');
    return;
  }

  verifyCode(username, verificationCode)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      const statusCode = httpResponses[error.message] || 500;
      res.status(statusCode).json(error.message);
    });
});

app.delete('/user/delete', (req, res) => {
  if (!req.query.username || !req.query.token) {
    res.status(400).send('Bad request');
    return;
  }

  authUserDelete(req.query.username, req.query.token)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      const statusCode = httpResponses[error.message] || 500;
      res.status(statusCode).json(error.message);
    });
});

app.get('/user/get', (req, res) => {
  if (!req.query.token) {
    res.status(400).send('Bad request');
    return;
  }
  let username = null;
  if (req.query.username !== null) {
    username = req.query.username;
  }
  authUserGet(username, req.query.token)
    .then((response) => res.status(200).send(response))
    .catch((error) => {
      const statusCode = httpResponses[error.message] || 500;
      res.status(statusCode).json(error.message);
    });
});

app.post('/feedback/create', async (req, res) => {

  // take the body, filter to see if input is there
  // if no input, raises error for invalid input since nothings there.
  const { rating, feedback, token} = req.body;
  if (!rating || !feedback || !token) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // else, it creates rating + feedback and calls the userfeedback function
  // which inserts to the DB

  try {
    // verifies token inside function called
    await userFeedback(feedback, rating, token);
    return res.status(200).json({ message: 'Feedback received' });
	  } catch (error) {
    return res.status(500).json({ error: error.message });
	  }
});

app.post('/help/create', async (req, res) => {

  const { userEmail, textHelp, token} = req.body;

  if (!userEmail || !textHelp || !token) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // inserting the data into the DB, raise error if its unsuccessful
  try {
    // verifies token inside function called
    await requestHelp(userEmail, textHelp, token);

    ////remove comments once database setup for this ////
    await createNotification('Help Request', token);
    ///////////////////////////////////////////////

    return res.status(200).json(
      { message: 'Request for help was lodged successfully' }
    );

  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    return res.status(statusCode).json(error.message);
  }
});

app.get('/help/get', async (req, res) => {

  const {state, token} = req.query;
  const validStates = ['active', 'closed', 'all'];
  // above are the current only valid states that can be requested
  // if additional states are required,
  // will need to fix function being called
  if (!validStates.includes(state) || !token) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    // verifies token inside function called
    const result = await helpList(state, token);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.get('/user/login', async (req, res) => {
  if (!req.query.username || !req.query.password) {
    res.status(400).send('Bad request');
    return;
  }
  const username = req.query.username;
  const password = req.query.password;
  try {
    const response = await authUserLogin(username, password);
    if (tokens.existsByToken(response)) { // if response is a JWT token
      res.status(200).send(response);
    } else {
      res.sendStatus(500);
    }
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.get('/user/logout', (req, res) => {
  if (!req.query.token) {
    res.status(400).send('Bad request');
  }

  try {
    authUserLogout(req.query.token);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.get('/user/sendCode', async (req, res) => {
  if (!req.query.username || req.query.username.length === 0) {
    res.status(400).send('Bad request');
    return;
  }

  try {
    await sendCode(req.query.username);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.get('/spaces/search', (req, res) => {
  if (!req.query.token) {
    res.status(401).send('Unauthorized');
    return;
  }
  if (!req.query.keywords) {
    res.status(400).send('Bad request');
    return;
  }

  const keywords = req.query.keywords || null;
  const features = req.query.features || null;

  searchSpaces(req.query.token, keywords, features)
    .then((response) => res.status(200).send(response))
    .catch((error) => {
      const statusCode = httpResponses[error.message] || 500;
      res.status(statusCode).json(error.message);
    });
});

app.get('/spaces/get/:spaceID', (req, res) => {
  if (!req.query.token) {
    res.status(401).send('Unauthorized');
    return;
  }
  if (!req.params.spaceID) {
    res.status(400).send('Bad request');
    return;
  }

  getSpaces(req.params.spaceID, req.query.token)
    .then((response) => res.status(200).send(response))
    .catch((error) => {
      const statusCode = httpResponses[error.message] || 500;
      res.status(statusCode).json(error.message);
    });
});

app.post('/spaces/create', async (req, res) => {
  if (!req.body.token) {
    res.status(401).send('Unauthorized');
    return;
  }

  const { Name, Type, Capacity, Projector, Whiteboard,
    Desktops, Thumbnail, Description } = req.body;

  try {
    const id = await createSpace(Name, Type, Capacity, Projector,
      Whiteboard, Desktops, Thumbnail, Description);
    res.status(200).send('SpaceId: ' + id);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }

});

app.post('/space/checkIn', async (req, res) => {
  const { username, pin, roomNumber } = req.body;

  if (!username || !pin || !roomNumber) {
    return res.status(400).send('Bad request');
  }

  try {
    await spaceCheckIn(username, pin, roomNumber);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.get('/floorplan/list', (req, res) => {
  if (!req.query.token) {
    res.status(401).send('Unauthorized');
    return;
  }

  listFloorplans(req.query.token)
    .then((response) => res.status(200).send(response))
    .catch((error) => {
      const statusCode = httpResponses[error.message] || 500;
      res.status(statusCode).json(error.message);
    });
});

app.get('/floorplan/get', (req, res) => {
  if (!req.query.token) {
    res.status(401).send('Unauthorized');
    return;
  }

  let floorplanID  = null;
  if (req.query.floorplanID !== null) {
    floorplanID = req.query.floorplanID;
  }

  getFloorplans(req.query.token, floorplanID)
    .then((response) => res.status(200).send(response))
    .catch((error) => {
      const statusCode = httpResponses[error.message] || 500;
      res.status(statusCode).json(error.message);
    });
});

app.post('/floorplan/create', async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send('Bad request');
    return;
  }

  if (!req.body.token) {
    res.status(401).send('Unauthorized');
    return;
  }
  try {
    await floorplansCreate(req.body);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.post('/floorplan/edit', async (req, res) => {
  if (!req.body.token || !req.body.FloorplanID) {
    res.status(401).send('Unauthorized');
    return;
  }
  try {
    await floorplansEdit(req.body.token, req.body.FloorplanID, req.body.Name,
      req.body.Pins, req.body.Image);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.post('/booking/create', async (req, res) => {
  const { token, spaceId, startTime, endTime, notes } = req.body;

  try {
    const message = await createBooking(token,
      spaceId, startTime, endTime, notes);
    res.status(200).send(message);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.post('/booking/override', async (req, res) => {
  const { username, spaceId, startTime, endTime, token } = req.body;
  if (!spaceId || !startTime || !endTime || !token || !username) {
    res.status(400).send('Bad request');
    return;
  }
  try {
    await overrideBooking(token, spaceId, startTime, endTime, username);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.post('/booking/edit', async (req, res) => {
  const { token, bookingId, newStartTime, newEndTime, notes } = req.body;
  if (!token || !bookingId) {
    res.status(400).send('Bad request');
    return;
  }
  try {
    await editBooking(token, bookingId, newStartTime, newEndTime, notes);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.post('/request/override', async (req, res) => {
  const type = 'Override Request';
  const { spaceID, startTime, endTime, token } = req.body;

  try {
    await createNotification(type, token, spaceID, startTime, endTime);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.get('/notifications/get', async (req, res) => {
  try {
    const results = await getNotifications(req.query.token);
    res.status(200).json(results);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.delete('/notifications/delete', async (req, res) => {
  if (!req.query.notificationID || !req.query.token) {
    res.status(400).send('Bad request');
    return;
  }

  try {
    await deleteNotification(req.query.notificationID, req.query.token);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

app.get('/bookings/availableSpaces/:floorplanID',
  async (req, res) => {
    const { floorplanID } = req.params;
    const { startTime, endTime } = req.query;

    try {
      const availableSpaces = await availableSpacesFloorId(floorplanID,
        startTime, endTime);
      res.status(200).json(availableSpaces);
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  });

app.get('/bookings/availableSpaces/', async (req, res) => {
  const { spaceID, startTime, endTime } = req.query;

  if (!spaceID || !startTime || !endTime) {
    return res.status(400).send('Bad Request');
  }

  try {
    const availableSlots = await availableSpacesSpaceId(spaceID,
      startTime, endTime);
    res.status(200).json(availableSlots);
  } catch (error) {
    const statusCode = error.message === 'Invalid date object received'
      ? 400 : (httpResponses[error.message] || 500);
    if (error.message === 'Database error') {
      res.status(statusCode).json(error.message);
    } else {
      res.status(statusCode).json({ message: error.message });
    }
  }
});

app.get('/bookings/list/:spaceID', async (req, res) => {
  const { spaceID } = req.params;
  const { token } = req.query;

  try {
    const bookings = await listBookingsSpaceId(spaceID, token);
    res.status(200).json(bookings);
  } catch (error) {

    const statusCode = error.message ===
    'Admin access required for this operation' ? 403 : 400;
    res.status(statusCode).json(error.message);
  }
});

app.delete('/bookings/delete', (req, res) => {
  if (!req.query.BookingID || !req.query.token) {
    res.status(400).send('Bad request');
    return;
  }

  removeBooking(req.query.BookingID, req.query.token)
    .then(() => res.sendStatus(200))
    .catch((error) => {
      const statusCode = httpResponses[error.message] || 500;
      res.status(statusCode).json(error.message);
    });
});

app.get('/bookings/get/:BookingsID', async (req, res) => {
  const { BookingsID } = req.params;
  const { token } = req.query;

  try {
    const bookings = await getBookingsWithId(BookingsID, token);
    res.status(200).json(bookings);
  } catch (error) {

    const statusCode = error.message ===
    'Admin access required for this operation' ? 403 : 400;
    res.status(statusCode).json(error.message);
  }
});

app.get('/bookings/getUserAll', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Token is required');
  }

  try {
    const bookings = await getAllBookingsForUser(token);
    res.status(200).json(bookings);
  } catch (error) {
    // distinguish between different types of errors
    // 500 is default internal server error code
    let statusCode = 500;
    if (error.message === 'Invalid token') {
      statusCode = 401;
    } else if (error.message === 'No active bookings found') {
      statusCode = 404;
    }

    res.status(statusCode).json(error.message);
  }
});

app.get('/usageStats/get', async (req, res) => {
  const { spaceId, token } = req.query;

  if (!token || !spaceId) {
    return res.status(400).send('Bad request');
  }

  try {
    const stats = await generateStats(token, spaceId);
    res.status(200).json(stats);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).json(error.message);
  }
});

const server = app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on port ${port}`);
});

function closeServer() {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        console.error('Error while closing server:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export { app, closeServer };
