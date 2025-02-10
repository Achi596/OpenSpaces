import { format } from 'date-fns';
import { sqlSelect } from './SqlTestCode.js';

export async function availableSpacesSpaceId(spaceId, startTime, endTime) {
  const bookings = await sqlSelect('Bookings', `SpaceID = "${spaceId}"`);
  if (new Date(startTime) > new Date(endTime)) {
    throw new Error('Invalid booking window');
  }
  // Check if space exists
  // const space = await sqlSelect('Spaces', `SpaceID = "${spaceId}"`);
  // if (space.length === 0) {
  //   throw new Error('Floorplan references a space that does not exist');
  // }
  // Find available booking windows in 30minute intervals
  const availableWindows = [];
  // iterate by 30minutes for each loop to check in interval window
  for (let i = new Date(startTime); i < new Date(endTime);
    i.setMinutes(i.getMinutes() + 30)) {
    const intervalStart = new Date(i);
    const intervalEnd = new Date(intervalStart.getTime() + 30 * 60000);

    let available = true;

    for (const booking of bookings) {
      const bookingStart = new Date(booking.StartTime);
      const bookingEnd = new Date(booking.EndTime);

      // Check if the interval overlaps with any booking
      if ((intervalStart < bookingEnd && intervalEnd > bookingEnd)
        || (intervalStart <= bookingStart && intervalEnd > bookingStart)
        || (intervalStart >= bookingStart && intervalEnd <= bookingEnd)) {
        available = false;
        break;
      }
    }

    if (available) {
      availableWindows.push({
        spaceId: spaceId,
        start: format(new Date(intervalStart), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        end: format(new Date(intervalEnd), 'yyyy-MM-dd\'T\'HH:mm:ss')
      });
    }
  }
  return availableWindows;
}
