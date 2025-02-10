// Generative AI was used to aid in the creation of this file

import { open, close } from './SqlTestCode.js';
export { ensureTables };

const tableSchemas = {
  Notifications: `
      CREATE TABLE IF NOT EXISTS \`Notifications\` (
        \`NotificationID\` INT(11) NOT NULL AUTO_INCREMENT,
        \`Type\` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`Message\` VARCHAR(250) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`Username\` VARCHAR(50) NULL DEFAULT NULL 
          COLLATE 'utf8mb4_general_ci',
        \`SpaceID\` INT(11) NULL DEFAULT NULL,
        \`StartTime\` DATETIME NULL DEFAULT NULL,
        \`EndTime\` DATETIME NULL DEFAULT NULL,
        PRIMARY KEY (\`NotificationID\`) USING BTREE
      )
      COMMENT='Stores data on all available Notifications including all 
        overrides and help requests'
      COLLATE='utf8mb4_general_ci'
      ENGINE=InnoDB
      AUTO_INCREMENT=45;
    `,
  Bookings: `
      CREATE TABLE IF NOT EXISTS \`Bookings\` (
        \`BookingID\` INT(11) NOT NULL AUTO_INCREMENT,
        \`SpaceID\` INT(11) NOT NULL,
        \`UserEmail\` VARCHAR(50) NOT NULL DEFAULT '' 
          COLLATE 'utf8mb4_general_ci',
        \`StartTime\` DATETIME NOT NULL,
        \`EndTime\` DATETIME NOT NULL,
        \`Notes\` VARCHAR(250) NULL DEFAULT NULL 
          COLLATE 'utf8mb4_general_ci',
        \`CheckedIn\` INT(10) UNSIGNED ZEROFILL NOT NULL DEFAULT '0000000000',
        \`Pin\` INT(11) NOT NULL,
        PRIMARY KEY (\`BookingID\`) USING BTREE
      )
      COMMENT='This table stores the details on all bookings made on the 
        platform'
      COLLATE='utf8mb4_general_ci'
      ENGINE=InnoDB
      AUTO_INCREMENT=55;
    `,
  Floorplans: `
      CREATE TABLE IF NOT EXISTS \`Floorplans\` (
        \`FloorplanID\` INT(11) NOT NULL AUTO_INCREMENT,
        \`Name\` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`Image\` VARCHAR(250) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`Pins\` TEXT NOT NULL COLLATE 'utf8mb4_general_ci',
        PRIMARY KEY (\`FloorplanID\`) USING BTREE
      )
      COLLATE='utf8mb4_general_ci'
      ENGINE=InnoDB
      AUTO_INCREMENT=45;
    `,
  HelpRequests: `
      CREATE TABLE IF NOT EXISTS \`HelpRequests\` (
        \`HelpID\` INT(11) NOT NULL AUTO_INCREMENT,
        \`textHelp\` TEXT NOT NULL COLLATE 'utf8mb4_general_ci',
        \`userEmail\` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`status\` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
        PRIMARY KEY (\`HelpID\`) USING BTREE
      )
      COLLATE='utf8mb4_general_ci'
      ENGINE=InnoDB
      AUTO_INCREMENT=52;
    `,
  Spaces: `
      CREATE TABLE IF NOT EXISTS \`Spaces\` (
        \`SpaceID\` INT(11) NOT NULL AUTO_INCREMENT,
        \`Name\` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`Type\` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
        \`Capacity\` INT(11) NULL DEFAULT NULL,
        \`Projector\` INT(11) NULL DEFAULT NULL,
        \`Whiteboard\` INT(11) NULL DEFAULT NULL,
        \`Desktops\` INT(11) NULL DEFAULT NULL,
        \`Thumbnail\` VARCHAR(250) NULL DEFAULT NULL 
          COLLATE 'utf8mb4_general_ci',
        \`Description\` VARCHAR(250) NULL DEFAULT NULL 
          COLLATE 'utf8mb4_general_ci',
        PRIMARY KEY (\`SpaceID\`) USING BTREE
      )
      COMMENT='Stores data on all available spaces including all rooms and 
        hotdesks'
      COLLATE='utf8mb4_general_ci'
      ENGINE=InnoDB
      AUTO_INCREMENT=277;
    `,
  UserFeedback: `
      CREATE TABLE IF NOT EXISTS \`UserFeedback\` (
        \`FeedbackID\` INT(11) NOT NULL AUTO_INCREMENT,
        \`Feedback\` TEXT NOT NULL COLLATE 'utf8mb4_general_ci',
        \`Rating\` INT(11) NOT NULL,
        PRIMARY KEY (\`FeedbackID\`) USING BTREE
      )
      COMMENT='Stores user feedback data received'
      COLLATE='utf8mb4_general_ci'
      ENGINE=InnoDB
      AUTO_INCREMENT=38;
    `,
  Users: `
      CREATE TABLE IF NOT EXISTS \`Users\` (
        \`Email\` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`FirstName\` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`LastName\` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`Password\` VARCHAR(64) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`Role\` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`AcountStatus\` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
        \`FacultyName\` VARCHAR(50) NULL DEFAULT NULL 
          COLLATE 'utf8mb4_general_ci',
        \`SchoolName\` VARCHAR(50) NULL DEFAULT NULL 
          COLLATE 'utf8mb4_general_ci',
        \`VerificationCode\` INT(11) NULL DEFAULT NULL,
        \`CodeExpiry\` DATETIME NULL DEFAULT NULL,
        \`Bookings\` INT(10) UNSIGNED ZEROFILL NOT NULL,
        \`Attendance\` INT(10) UNSIGNED ZEROFILL NOT NULL,
        \`Notes\` VARCHAR(50) NULL DEFAULT NULL 
          COLLATE 'utf8mb4_general_ci',
        PRIMARY KEY (\`Email\`) USING BTREE
      )
      COMMENT='Contains all user account data for the platform'
      COLLATE='utf8mb4_general_ci'
      ENGINE=InnoDB;
    `
};

async function ensureTables() {
  const connection = await open();
  try {
    for (const [tableName, createQuery] of Object.entries(tableSchemas)) {
      // Check if table exists
      const [tables] = await
      connection.execute(`SHOW TABLES LIKE '${tableName}'`);
      if (tables.length === 0) {
        // Table does not exist, create it
        await connection.execute(createQuery);
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error('Database error');
  } finally {
    await close(connection);
  }
}
