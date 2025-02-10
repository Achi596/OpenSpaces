import fs from 'fs';
import csv from 'csv-parser';
import { sqlInsert, sqlSelect } from '../../Backend/SqlTestCode.js';
import { generateHash, isUNSWEmail } from '../../Backend/helper.js';

const processCSV = async (filePath) => {
  const users = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      users.push({
        email: row['Email ID'],
        firstName: row['Candidate Name'].split(' ')[0],
        lastName: '',
        password: row['Password'],
        faculty: row['Faculty Name'],
        school: row['School Name'],
        role: row['Role'], // remove to add hdr
      });
    })
    .on('end', async () => {
      console.error('CSV file successfully processed');
      await insertUsersIntoDB(users);
    });
};

const insertUsersIntoDB = async (users) => {
  const tablename = 'Users';

  for (const user of users) {
    const username = user.email;
    const condition = `Email="${username}"`;

    try {
      const dbResponse = await sqlSelect(tablename, condition);

      if (dbResponse.length !== 0) {
        console.error(`User ${username} already exists in the database.`);
        continue;
      }

      if (!isUNSWEmail(username)) {
        console.error(`Email ${username} is not a UNSW email.`);
        continue;
      }

      const parameters = ['Email', 'FirstName', 'LastName', 'Password', 'Role',
        'AcountStatus', 'FacultyName', 'SchoolName', 'Notes'];
      const values = [
        username, user.firstName, user.lastName,
        generateHash(user.password ), user.role, 'unverified',
        user.faculty, user.school, null
      ];

      await sqlInsert(tablename, parameters, values);
      console.error(`User ${username} inserted successfully.`);
    } catch (error) {
      console.error(`Error inserting user ${username}: ${error.message}`);
    }
  }
};

processCSV('ServerInfrastructure\\SQLServer\\staff.csv');
