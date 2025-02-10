import { sqlInsert, sqlSelect, sqlUpdate, sqlDelete } from './SqlTestCode.js';
import { generateVerificationCode } from './helper.js';
import { format } from 'date-fns';
import { tokens } from './server.js';
import { getSpaces } from './spaces';
import { sendEmail } from './mailHelpers.js';

export { createBooking, editBooking, listBookingsSpaceId, overrideBooking,
  removeBooking, getBookingsWithId };

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatDate(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ` +
  `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

async function handleCompleteOverlap(ogBooking, space) {
  //Update old booking with new one
  let booking = await sqlSelect('Bookings',
    `BookingID = "${ogBooking.BookingID}"`);
  booking = booking[0];
  await sqlDelete('Bookings', `BookingID = ${ogBooking.BookingID}`);
  const user = await sqlSelect('Users', `Email = "${booking.UserEmail}"`);
  if (user[0].Bookings > 0) {
    user[0].Bookings -= 1;
  }
  await sqlUpdate('Users', ['Bookings'], [user[0].Bookings],
    `Email = "${user[0].Email}"`);
  await sendEmail(booking.UserEmail, 'Booking Cancelled',
    `Your booking for ${space.Name} has been cancelled by and admin,`);
  return;
}

async function handlePartialOverlapStart(ogBooking, newBooking, space) {
  //set old booking start to new booking end
  let booking = await sqlSelect('Bookings',
    `BookingID = "${ogBooking.BookingID}"`);
  booking = booking[0];
  await sqlUpdate('Bookings', ['StartTime'], [formatDate(newBooking.EndTime)],
    `BookingID = "${ogBooking.BookingID}"`);
  // const user = await sqlSelect('Users', `Email = "${booking.UserEmail}"`);
  await sendEmail(booking.UserEmail, 'Booking Modified',
    `Your booking for ${space.Name} has been modified by an admin`);
  return;
}

async function handlePartialOverlapEnd(ogBooking, newBooking, space) {
  //set old booking end to new booking start
  let booking = await sqlSelect('Bookings',
    `BookingID = "${ogBooking.BookingID}"`);
  booking = booking[0];
  await sqlUpdate('Bookings', ['EndTime'], [formatDate(newBooking.StartTime)],
    `BookingID = "${ogBooking.BookingID}"`);
  // const user = await sqlSelect('Users', `Email = "${booking.UserEmail}"`);
  await sendEmail(booking.UserEmail, 'Booking Modified',
    `Your booking for ${space.Name} has been modified by an admin`);
  return;
}

async function createBooking(token, spaceId,
  startTime, endTime, notes) {
  // Converting input times to Date objects
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Align start time to the nearest 30-minute increment
  start.setMinutes(Math.floor(start.getMinutes() / 30) * 30, 0, 0);
  // Align end time to the next 30-minute increment
  end.setMinutes(Math.ceil(end.getMinutes() / 30) * 30, 0, 0);

  // Ensure the booking is within the same day
  if (start.toDateString() !== end.toDateString()) {
    throw new Error('Bookings must be within the same day.');
  }

  // Ensure the booking is within the allowed hours (9am to 9pm) and on weekdays
  const startHour = start.getHours();
  const endHour = end.getHours();
  const startDay = start.getDay();
  const endDay = end.getDay();

  if (startHour < 9 || endHour > 21 || startDay === 0 ||
    startDay === 6 || endDay === 0 || endDay === 6) {
    throw new Error('Bookings are only allowed from 9am to 9pm on weekdays.');
  }

  // Get the type of the space (Room or Hot Desk)
  const space = await sqlSelect('Spaces', `SpaceID = ${spaceId}`);

  if (space.length === 0) {
    throw new Error('Space not found');
  }

  // Check if token belongs to a valid verified account
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }

  const user = tokens.getUser(token);
  const dbResponseUser = await sqlSelect('Users', `Email="${user}"`);

  if (dbResponseUser.length === 0) {
    throw new Error('The user does not exist');
  }

  if (dbResponseUser[0].AcountStatus === 'unverified') {
    throw new Error('unverified account');
  }

  // Check user's booking attendance if they are not a new user
  if (dbResponseUser[0].Bookings > 5) {
    if (dbResponseUser[0].Attendance/(dbResponseUser[0].Bookings) < 0.2) {
      // Update the account status to suspended
      try {
        const parameters = ['AcountStatus'];
        const values = ['suspended'];
        await sqlUpdate('Users', parameters,
          values, `Email="${dbResponseUser[0].Email}"`);
      } catch (error) {
        throw new Error(error.message);
      }

      throw new Error('This account has been suspended for unsatisfactory ' +
        'attendance, try creating an override request! (～￣(OO)￣)ブ');
    }
  }

  // Unsuspend account if attendance ratio is restored
  if (dbResponseUser[0].AcountStatus !== 'verified') {
    try {
      const parameters = ['AcountStatus'];
      const values = ['verified'];
      await sqlUpdate('Users', parameters,
        values, `Email="${dbResponseUser[0].Email}"`);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Check if the user is authorized to book the space
  if (space[0].Type === 'room') {
    if (dbResponseUser[0].Role !== 'Admin' &&
      !(dbResponseUser[0].Role === 'Staff' &&
      dbResponseUser[0].SchoolName === 'School of Computer Sci & Eng')) {
      throw new Error('Rooms are only available to admins and CSE staff, ' +
        'try creating an override request! ヾ(≧▽≦*)o');
    }
  }

  // Check if the space is available for the given time slot
  const isAvailable = await sqlSelect(
    'Bookings',
    `SpaceID = ${spaceId} AND StartTime < '${formatDateTime(end)}'
    AND EndTime > '${formatDateTime(start)}'`
  );

  if (!(isAvailable.length === 0)) {
    throw new Error('Space is not available for the selected time slot');
  }

  // Generate Booking Pin
  const code = generateVerificationCode().code;

  // Insert the booking into the database
  await sqlInsert(
    'Bookings',
    ['SpaceID', 'UserEmail', 'StartTime', 'EndTime',
      'Notes', 'CheckedIn', 'Pin'],
    [spaceId, dbResponseUser[0].Email, formatDateTime(start),
      formatDateTime(end), notes, 0, code]
  );

  // Increment the user's booking counter
  try {
    await sqlUpdate('Users', ['Bookings'], [dbResponseUser[0].Bookings + 1],
      `Email="${dbResponseUser[0].Email}"`);
  } catch (error) {
    throw new Error(error.message);
  }

  // Email the user a booking confirmation with their pin
  const emailSubject = `Booking Confirmation for "${space[0].Name}"`;
  const emailBody = `Hi ${dbResponseUser[0].FirstName},

  Thank you for booking with OpenSpaces.
  
  To check in to your room, scan the QR code upon entry and enter your details.
  
  Booking Details:
  Check In Pin: ${code}
  Start Time: ${formatDateTime(start)}
  End Time: ${formatDateTime(end)}
  
  For help locating the building or space, `
  + `reach out to us via the Help Form on our webpage.
  
  Thank you!`;
  await sendEmail(dbResponseUser[0].Email, emailSubject, emailBody);

  return 'Booking created successfully';
}

async function editBooking(token, bookingId, newStartTime,
  newEndTime, notes) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }
  try {
    const originalBooking = await sqlSelect('Bookings',
      `BookingID = "${bookingId}" AND UserEmail = "${tokens.getUser(token)}"`);
    if (originalBooking.length === 0) {
      throw new Error('Booking does not exist');
    }
    newStartTime = newStartTime || originalBooking[0].StartTime;
    newEndTime = newEndTime || originalBooking[0].EndTime;
    notes = notes || originalBooking[0].Notes;
    const potentialConflicts = await listBookingsSpaceId(
      originalBooking[0].SpaceID, token);
    const newStart = format(new Date(newStartTime), 'yyyy-MM-dd\'T\'HH:mm:ss');
    const newEnd = format(new Date(newEndTime), 'yyyy-MM-dd\'T\'HH:mm:ss');
    if (newStart >= newEnd) {
      throw new Error('Invalid booking window');
    }
    const conflicts = potentialConflicts.filter(booking => {
      const start = format(new Date(booking.StartTime),
        'yyyy-MM-dd\'T\'HH:mm:ss');
      const end = format(new Date(booking.EndTime),
        'yyyy-MM-dd\'T\'HH:mm:ss');
      return (newStart < end && newEnd > start);
    });
    if (conflicts.length > 0) {
      throw new Error('Booking conflicts with existing booking(s)');
    }
    await sqlUpdate('Bookings', ['StartTime', 'EndTime', 'Notes'],
      [newStartTime, newEndTime, notes],
      `BookingID = "${bookingId}"`);
  } catch (error) {
    throw new Error(error.message);
  }
  return;
}

async function listBookingsSpaceId(spaceID, token) {
  // Check if the token is valid
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }

  // Retrieve all active bookings for the given spaceID
  const bookings = await sqlSelect('Bookings', `SpaceID = '${spaceID}'`);

  // Format the StartTime and EndTime to include the 'T' and remove the 'Z'
  const filteredBookings = bookings.map(booking => {
    const startTime = format(new Date(booking.StartTime),
      'yyyy-MM-dd\'T\'HH:mm:ss');
    const endTime = format(new Date(booking.EndTime),
      'yyyy-MM-dd\'T\'HH:mm:ss');
    return {
      BookingID: booking.BookingID,
      StartTime: startTime,
      EndTime: endTime,
      Notes: booking.Notes,
    };
  });

  return filteredBookings;
}

async function overrideBooking(token, spaceID, startTime,
  endTime, username) {
  const requestedStart = new Date(startTime);
  const requestedEnd = new Date(endTime);
  // Invalid tokens already checked in listBookingsSpaceId function
  if (requestedStart >= requestedEnd) {
    throw new Error('Invalid booking window');
  }
  try {
    //ensure space actually exists, error handled inside getSpaces
    const space = await getSpaces(spaceID, token);
    //ensure user exists
    const user = await sqlSelect('Users', `Email = "${username}"`);
    if (user.length === 0) {
      throw new Error('The user does not exist');
    }
    const bookings = await listBookingsSpaceId(spaceID, token);
    const completeOverlaps = bookings.filter(booking => {
      const start = new Date(booking.StartTime);
      const end = new Date(booking.EndTime);
      return requestedStart <= start && requestedEnd >= end;
    });
    for (const booking of completeOverlaps) {
      handleCompleteOverlap(booking, space);
    }
    const partialOverlapsStart = bookings.filter(booking => {
      const start = new Date(booking.StartTime);
      const end = new Date(booking.EndTime);
      return requestedStart < start && requestedEnd > start
        && requestedEnd < end;
    });
    if (partialOverlapsStart.length > 0) {
      //handle for all partial overlaps
      for (const booking of partialOverlapsStart) {
        handlePartialOverlapStart(booking, {
          StartTime: requestedStart,
          EndTime: requestedEnd,
        }, space);
      }
    }
    const partialOverlapsEnd = bookings.filter(booking => {
      const start = new Date(booking.StartTime);
      const end = new Date(booking.EndTime);
      return requestedStart > start && requestedStart < end;
    });
    for (const booking of partialOverlapsEnd) {
      handlePartialOverlapEnd(booking, {
        StartTime: requestedStart,
        EndTime: requestedEnd,
      }, space);
    }
    const pin = generateVerificationCode().code;
    await sqlInsert('Bookings', ['SpaceID', 'UserEmail', 'StartTime', 'EndTime',
      'CheckedIn', 'Pin'],
    [spaceID, username, formatDate(requestedStart),
      formatDate(requestedEnd), 0, pin]);
    await sqlUpdate('Users', ['Bookings'], [user[0].Bookings + 1],
      `Email = "${username}"`);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function removeBooking(BookingID, token) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }

  const email = tokens.getUser(token);
  const tablename = 'Bookings';
  const condition = `BookingID="${BookingID}"`;

  const dbResponse = await sqlSelect(tablename, condition);

  if (dbResponse.length === 0) {
    throw new Error('The Booking does not exist');
  }

  const space = await getSpaces(dbResponse[0].SpaceID, token);

  const dbResponseUser = await sqlSelect('Users', `Email="${email}"`);
  const isAdmin = dbResponseUser.length > 0
    && dbResponseUser[0].Role === 'Admin';
  const isOwner = dbResponse[0].UserEmail === email;

  if (!isAdmin && !isOwner) {
    throw new Error('Admin access required for this operation');
  }

  try {
    await sqlDelete(tablename, condition);
    // send email if successful
    sendEmail(email, 'Booking Cancellation',
      `You have successfully cancelled your booking for 
      ${space.Name}`);
    // decrement bookings counter on user's profile
    if (dbResponseUser[0].Bookings > 0) {
      dbResponseUser[0].Bookings -= 1;
    }
    await sqlUpdate('Users', ['Bookings'],
      [dbResponseUser[0].Bookings], `Email="${email}"`);
    return;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getBookingsWithId(BookingID, token) {
  // Check if the token is valid
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }

  const email = tokens.getUser(token);
  const tablename = 'Bookings';
  const condition = `BookingID="${BookingID}"`;
  // Retrieve all active bookings for the given BookingID
  const bookingInfo = await sqlSelect(tablename, condition);

  if (bookingInfo.length === 0) {
    // its empty, meaning no such booking with BookingID exists
    throw new Error('No bookings found');
  }

  // return the bookings details only if
  // its either admin or if its owner of the bookingID

  // below, gets USER with matching email, and checks if they admin
  // also checks if the user is the owner of the email
  const dbResponseUser = await sqlSelect('Users', `Email="${email}"`);
  const isAdmin = dbResponseUser.length > 0
    && dbResponseUser[0].Role === 'Admin';
  const isOwner = bookingInfo[0].UserEmail === email;

  // if its either admin or the owner, itll skip below
  if (!isAdmin && !isOwner) {
    throw new Error('Admin access required for this operation');
  }

  // below filters through the return info and removed checkedIn and Pin
  // from the results
  const filteredBookingInfo = bookingInfo.map(
    ({ CheckedIn, Pin, ...rest }) => rest
  );
  return filteredBookingInfo;
}

export async function getAllBookingsForUser(token) {

  // Check if the token is valid
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }

  // Get the email from the token
  const email = tokens.getUser(token);

  const tablename = 'Bookings';
  // const currentTime = formatDateTime(new Date());
  const condition = `UserEmail="${email}"`;

  // below is the condition for ALL BOOKINGS THAT USER CAN ENTER IN
  // THE END TIME > CURERNT TIME
  // currently commented out so function can return all
  // const condition = `UserEmail="${email}" AND EndTime > "${currentTime}"`;

  // Retrieve all active bookings for the userEmail
  const bookingInfo = await sqlSelect(tablename, condition);

  if (bookingInfo.length === 0) {
    // No bookings found or all bookings have ended
    throw new Error('No active bookings found');
  }
  // Filter through bookings and remove checkedIn and PIN
  const filteredBookingInfo = bookingInfo.map(
    ({ CheckedIn, Pin, ...rest }) => rest);
  return filteredBookingInfo;
}

