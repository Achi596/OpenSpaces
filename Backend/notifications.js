import { sqlInsert, sqlDelete, sqlSelectAll, sqlSelect } from './SqlTestCode';
import { tokens } from './server';

export { createNotification, deleteNotification, getNotifications };

const notificationTypes = {
  'Override Request': 'Booking override requested for: ',
  'Help Request': 'Technical support requested for: ',
};

async function createNotification(type, token, spaceID=null,
  startTime=null, endTime=null) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }
  if (spaceID) {
    // Check if space exists
    const space = await sqlSelect('Spaces', `SpaceID = ${spaceID}`);
    if (space.length === 0) {
      throw new Error('Space not found');
    }
  }
  const parameters = ['Type', 'Message', 'Username', 'SpaceID',
    'StartTime', 'EndTime'];
  const values = [type, notificationTypes[type], tokens.getUser(token),
    spaceID, startTime, endTime];
  const tablename = 'Notifications';
  try {
    await sqlInsert(tablename, parameters, values);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
  * Delete a notification
  * @param {number} id - Notification ID
  * @returns {Promise} - Notification deleted
  * @throws {Error} - Notification not found
 */
async function deleteNotification(id, token) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }
  const dbResponse = await sqlSelect('Users',
    `Email = '${tokens.getUser(token)}'`);
  // Check user perms are admin level
  if (dbResponse[0].Role !== 'Admin') {
    throw new Error('Admin access required for this operation');
  }
  // Check if notification exists
  const notification = await sqlSelect('Notifications',
    `NotificationID = ${id}`);
  if (notification.length === 0) {
    throw new Error('Notification not found');
  }
  const tablename = 'Notifications';
  const condition = `NotificationID = ${id}`;

  try {
    await sqlDelete(tablename, condition);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
  * Get all notifications
  * @param {string} token - User token
  * @returns {Promise} - All notifications
  * @throws {Error} - Invalid token
  * @throws {Error} - Admin access required for this operation
 */
async function getNotifications(token) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }
  const dbResponse = await sqlSelect('Users',
    `Email = '${tokens.getUser(token)}'`);
  // Check user perms are admin level
  if (dbResponse[0].Role !== 'Admin') {
    throw new Error('Admin access required for this operation');
  }
  const tablename = 'Notifications';

  try {
    const dbResponse = await sqlSelectAll(tablename);
    return dbResponse;
  } catch (error) {
    throw new Error(error.message);
  }
}
