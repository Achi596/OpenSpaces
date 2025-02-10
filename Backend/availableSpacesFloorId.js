import { format } from 'date-fns';
import { availableSpacesSpaceId } from './availableSpacesSpaceId.js';
import { sqlSelect } from './SqlTestCode.js';

export async function availableSpacesFloorId(floorplanID, startTime, endTime) {
  // Check floorplan exists
  const floorplan = await sqlSelect('Floorplans',
    `FloorplanID = "${floorplanID}"`);
  if (floorplan.length === 0) {
    throw new Error('The floorplan does not exist');
  }
  // Check the booking window is valid
  if (new Date(startTime) >= new Date(endTime)) {
    throw new Error('Invalid booking window');
  }
  if (!startTime || startTime === '') {
    startTime = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
  }
  if (!endTime || endTime === '') {
    endTime = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
  }

  // Check each space in the floorplan
  const pins = JSON.parse(floorplan[0].Pins);
  const availableSpaces = [];
  for (const pin of pins) {
    const available = await availableSpacesSpaceId(pin.spaceID,
      startTime, endTime);
    if (available.length > 0) {
      availableSpaces.push({
        SpaceId: pin.spaceID,
      });
    }
  }
  return availableSpaces;
}
