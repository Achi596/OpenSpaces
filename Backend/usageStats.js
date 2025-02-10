import { tokens } from './server.js';
import { sqlSelect } from './SqlTestCode.js';

export async function generateStats(token, spaceId) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }
  const User = await sqlSelect('Users', `Email="${tokens.getUser(token)}"`);
  if (User[0].Role !== 'Admin') {
    throw new Error('Admin access required for this operation');
  }
  const space = await sqlSelect('Spaces', `SpaceID="${spaceId}"`);
  if (space.length === 0) {
    throw new Error('Space not found');
  }
  try {
    const totalBookings = await sqlSelect('Bookings', `SpaceID="${spaceId}"`);
    // Split the array into bookings with checkedIn value of 1 and 0
    const checkedBookings = totalBookings.filter(booking =>
      booking.CheckedIn !== 0);
    // Only add bookings whose end time is before the current time
    const notCheckedInBookings = totalBookings.filter(booking => {
      const endTime = new Date(booking.EndTime);
      const currentTime = new Date();
      return endTime < currentTime && booking.CheckedIn === 0;
    });
    // Calculate the total number of bookings within the last week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekBookings = totalBookings.filter(booking => {
      const startTime = new Date(booking.StartTime);
      return startTime > lastWeek;
    });
    return {
      totalBookings: totalBookings.length,
      checkedInBookings: checkedBookings.length,
      notCheckedInBookings: notCheckedInBookings.length,
      totalBookingsLastWeek: lastWeekBookings.length
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
