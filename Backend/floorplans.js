import { sqlSelect, sqlInsert, sqlUpdate } from './SqlTestCode.js';
import { tokens } from './server.js';
import { isImageUrl } from './helper.js';

export { listFloorplans, getFloorplans, floorplansCreate, floorplansEdit };

async function listFloorplans(token) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }

  try {
    const list = await sqlSelect('Floorplans', 'true');

    const results = list.map(list => ({
      FloorplanID: list.FloorplanID,
      Name: list.Name
    }));

    return results;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getFloorplans(token, floorplanID) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }

  try {
    const ID = parseInt(floorplanID, 10);

    if (!Number.isInteger(ID)) {
      throw new Error('Invalid floorplanID');
    }

    const condition = `FloorplanID="${floorplanID}"`;
    const results = await sqlSelect('Floorplans', condition);

    if (results.length === 0) {
      throw new Error('The floorplan does not exist');
    }

    return results;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function floorplansCreate(data) {
  if (!tokens.existsByToken(data.token)) {
    throw new Error('Invalid token');
  }

  const Name = data.Name;
  const Image = data.Image;
  const Pins = data.Pins;

  try {
    if (!Name || Name.length > 50) {
      throw new Error('Invalid Name');
    }

    if (!Pins) {
      throw new Error('Pins cannot be empty');
    }

    if (!isImageUrl(Image)) {
      throw new Error('Image must be a valid url to an image');
    }

    const parameters = ['Name', 'Image', 'Pins'];

    const values = [Name, Image, Pins];
    await sqlInsert('Floorplans', parameters, values);
    return;

  } catch (error) {
    throw new Error(error.message);
  }
}

async function floorplansEdit(token, FloorplanID, Name, Pins, Image) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }

  const dbResponse = await sqlSelect('Users',
    `Email = '${tokens.getUser(token)}'`);
  // Check user perms are admin level
  if (dbResponse[0].Role !== 'Admin') {
    throw new Error('Admin access required for this operation');
  }

  // check if floorplan exists
  const floorplan = await sqlSelect('Floorplans',
    `FloorplanID = "${FloorplanID}"`);
  if (floorplan.length === 0) {
    throw new Error('Floorplan does not exist');
  }

  const parameters = ['Name', 'Pins', 'Image'];

  try {
    const ogFloorplan = await sqlSelect('Floorplans',
      `FloorplanID = "${FloorplanID}"`);
    const newName = Name || ogFloorplan[0].Name;
    const newPins = Pins || ogFloorplan[0].Pins;
    const newImage = Image || ogFloorplan[0].Image;
    const values = [newName, newPins, newImage];
    await sqlUpdate('Floorplans', parameters, values,
      `FloorplanID = "${FloorplanID}"`);
    return;
  } catch (error) {
    throw new Error(error.message);
  }
}
