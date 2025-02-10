import { sqlSelect, sqlInsert, sqlUpdate } from './SqlTestCode.js';
import { tokens } from './server.js';

export { searchSpaces, getSpaces, createSpace, spaceCheckIn };

async function searchSpaces(token, query, features) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }

  if (!query || query.length > 200) {
    throw new Error('Invalid search query');
  }

  const validSortFields = ['Capacity', 'Projector', 'Whiteboard', 'Desktops'];
  if (features && !validSortFields.includes(features)) {
    throw new Error('Invalid sort field');
  }

  try {
    const results = await sqlSelect('Spaces', `Name LIKE '%${query}%'
      OR Type LIKE '%${query}%'`);

    if (features) {
      results.sort((a, b) => b[features] - a[features]);
    }

    return results;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getSpaces(spaceID, token) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }
  const dbResponse = await sqlSelect('Users',
    `Email = '${tokens.getUser(token)}'`);
  if (dbResponse[0].AcountStatus !== 'verified') {
    throw new Error('unverified account');
  }
  const tableName = 'Spaces';
  const condition = `SpaceID = ${spaceID}`;
  try {
    const results = await sqlSelect(tableName, condition);
    if (results.length === 0) {
      throw new Error('Space not found');
    }
    return results[0];
  } catch (error) {
    throw new Error(error.message);
  }
}

async function createSpace(Name, Type, Capacity, Projector, Whiteboard,
  Desktops, Thumbnail, Description) {

  const tablename = 'Spaces';
  const parameters = ['Name', 'Type', 'Capacity', 'Projector', 'Whiteboard',
    'Desktops', 'Thumbnail', 'Description'];
  const values = [Name, Type, Capacity, Projector, Whiteboard,
    Desktops, Thumbnail, Description];

  try {

    const result = await spaceExists(tablename, 'Name', Name);

    // if result = true, that means that the space exists
    // if result = false, it means that the space doesnt exist
    // hence add to spaces
    if (result === true) {
      throw new Error(`Space with the name "${Name}" already exists.`);
    } else {
      // put space inside the DB since it doesnt exist already
      await sqlInsert(tablename, parameters, values);
      const space = await sqlSelect(tablename, `Name="${Name}"`);
      return space[0].SpaceID;
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

async function spaceExists(tablename, parameter, Name) {
  const condition = `${parameter}='${Name}'`;
  const result = await sqlSelect(tablename, condition);
  if (result.length > 0) {
    return true;
  } else {
    // it doesn't exist in DB, so returns false
    return false;
  }
}

async function spaceCheckIn(username, code, roomNumber) {
  // ensure username and room code matches
  // and current time is within the booking window
  try {
    const user = await sqlSelect('Users', `Email = "${username}"`);
    if (user.length === 0) {
      throw new Error('The user does not exist');
    }
    const matchingSpaces = await findSpaceByName(roomNumber);
    const matchingSpaceIDs = matchingSpaces.map(space => space.SpaceID);
    if (matchingSpaceIDs.length === 0) {
      throw new Error('Space not found');
    }
    const tablename = 'Bookings';
    const condition = `UserEmail = "${username}" AND Pin = "${code}"`;
    const bookings = await sqlSelect(tablename, condition);
    // Filter bookings by matching space IDs
    const filteredBookings = bookings.filter(booking =>
      matchingSpaceIDs.includes(booking.SpaceID)
    );

    if (filteredBookings.length < 1) {
      throw new Error('No bookings found');
    }
    if (filteredBookings[0].CheckedIn === 1) {
      throw new Error('Already checked in');
    }
    // Check the time
    const currTime = new Date();
    if (currTime > new Date(filteredBookings[0].EndTime)
      || currTime < new Date(filteredBookings[0].StartTime)) {
      throw new Error('Check-in must be within booking window');
    }
    // Update the booking to checked in
    await sqlUpdate('Bookings', ['CheckedIn'], [1],
      `BookingID = "${filteredBookings[0].BookingID}"`);
    // Increment the space check-in count for the user
    await sqlUpdate('Users', ['Attendance'], [user[0].Attendance + 1],
      `Email = "${username}"`);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function findSpaceByName(name) {
  const tablename = 'Spaces';
  const condition = `Name LIKE "%${name}%"`;
  try {
    const results = await sqlSelect(tablename, condition);
    if (results.length === 0) {
      throw new Error('Space not found');
    }
    return results;
  } catch (error) {
    throw new Error(error.message);
  }
}
