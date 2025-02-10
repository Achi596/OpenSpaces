import { closeServer, tokens, app } from '../server';
import supertest from 'supertest';

const request = supertest(app);
const testUserStudent = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@unsw.edu.au',
  password: '12345'
};
const testUserStudentVerified = {
  firstName: 'Johnny',
  lastName: 'Doe',
  email: 'johnny@unsw.edu.au',
  password: '12345'
};
const testSpaceValid = {
  spaceID: 1,
  name: 'Test Space',
  type: 'Hot Desk',
  Capacity: 1,
  Projector: 0,
  Whiteboard: 0,
  Desktops: 1,
  Thumbnail: 'https://www.example.com/image.jpg',
  Description: 'This is a test Hot Desk Space',
};

afterAll(async () => {
  // Close the server after all tests
  await closeServer();
});

// Mocking sqlSelect function
jest.mock('../SqlTestCode.js', () => {
  const actualModule = jest.requireActual('../SqlTestCode.js');
  return {
    ...actualModule,
    sqlSelect: jest.fn((tableName, condition) => {
      if (condition.includes(testSpaceValid.spaceID)) {
        return [testSpaceValid];
      }

      if (condition.includes(testUserStudent.email)) {
        return [
          {
            Email: testUserStudent.email,
            FirstName: testUserStudent.firstName,
            LastName: testUserStudent.lastName,
            Password: 'mocked-hash',
            Role: 'N/A',
            AcountStatus: 'unverified',
            VerificationCode: 123456,
            CodeExpiry: new Date((new Date()).getTime() + 80 * 60000),
            Notes: null
          }
        ];
      } else if (condition.includes(testUserStudentVerified.email)) {
        return [
          {
            Email: testUserStudentVerified.email,
            FirstName: testUserStudentVerified.firstName,
            LastName: testUserStudentVerified.lastName,
            Password: 'mocked-hash',
            Role: 'Admin',
            AcountStatus: 'verified',
            VerificationCode: null,
            CodeExpiry: null,
            Notes: null
          }
        ];
      }
      return [];
    }),
    sqlInsert: jest.fn((tableName, parameters, values) => {
      if (tableName === 'Users') {
        return;
      } else {
        throw new Error('Invalid tablename');
      }
    }),
    sqlUpdate: jest.fn((tableName, parameters, values, condition) => {
      if (tableName === 'Users') {
        return;
      } else {
        throw new Error('Invalid tablename');
      }
    }),
    sqlDelete: jest.fn((tableName, condition) => {
      if (tableName === 'Users') {
        return;
      } else {
        throw new Error('Invalid tablename');
      }
    }),
  };
});

// Mocking bcrypt.hash function
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((input, saltRounds) => {
    return Promise.resolve('mocked-hash'); // Return a fixed hash value
  }),
  compare: jest.fn().mockImplementation((input, hash) => {
    return Promise.resolve(input === '12345');
  }),
}));

jest.mock('../bootstrap', () => ({
  ensureTables: jest.fn().mockImplementation(() => {
    return Promise.resolve();
  }),
}));

jest.mock('../mailHelpers', () => ({
  sendEmail: jest.fn().mockImplementation((email, subject, body) => {
    return Promise.resolve();
  }),
}));

jest.spyOn(tokens, 'existsByToken').mockImplementation((token) => {
  if (token === 'mocked-token' || token === 'mocked-token2') {
    return true;
  }
  return false;
});

jest.spyOn(tokens, 'getUser').mockImplementation((token) => {
  if (token === 'mocked-token') {
    return testUserStudentVerified.email;
  }
  else if (token === 'mocked-token2') {
    return testUserStudent.email;
  }
  return null;
});

// Mocking generateToken function
jest.mock('../helper', () => {
  // Import the original module
  const originalModule = jest.requireActual('../helper');
  const currentTime = new Date();
  // Add 10 minutes to the current time
  const expiryTime = new Date(currentTime.getTime() + 80 * 60000);
  return {
    ...originalModule, // keep all original exports
    generateToken: jest.fn(() => 'mocked-token'),
    generateVerificationCode: jest.fn(() => ({
      code: 123456,
      expiryTime: expiryTime,
    })),
  };
});

describe('GET /spaces/get/:spaceID', () => {
  it ('should return a space with valid spaceID', async () => {
    const response = await request
      .get(`/spaces/get/${testSpaceValid.spaceID}`)
      .query({ token: 'mocked-token' })
      .set('Accept', 'application/json');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(testSpaceValid);
  });

  it ('should return an error with invalid spaceID', async () => {
    const response = await request
      .get('/spaces/get/2')
      .query({ token: 'mocked-token' })
      .set('Accept', 'application/json');
    expect(response.status).toBe(404);
  });
});
