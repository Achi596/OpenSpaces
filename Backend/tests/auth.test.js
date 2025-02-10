
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

jest.mock('../bootstrap', () => ({
  ensureTables: jest.fn().mockImplementation(() => {
    return Promise.resolve();
  }),
}));

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

describe('POST /user/create', () => {
  it('should throw error when given wrong body', async () => {
    const response = await request
      .post('/user/create')
      .send({})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(400);
  });

  it('should say user already exists', async () => {
    const response = await request
      .post('/user/create')
      .send(testUserStudent)
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(409);
  });

  it('should create a new user', async () => {
    const testUser = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@unsw.edu.au',
      password: '12345',
      role: 'Admin'
    };
    const response = await request
      .post('/user/create')
      .send(testUser)
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);
  });

  it('should give error when using an email from other domains', async () => {
    const testUser = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@gmail.com',
      password: '12345',
      role: 'Admin'
    };
    const testUser2 = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jan;e@unsw.edu.au',
      password: '12345',
      role: 'Admin'
    };
    const testUser3 = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jan e@unsw.edu.au',
      password: '12345',
      role: 'Admin'
    };
    const response = await request
      .post('/user/create')
      .send(testUser)
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(403);
    const response1 = await request
      .post('/user/create')
      .send(testUser2)
      .set('Accept', 'application/json');
    expect(response1.statusCode).toBe(403);
    const response2 = await request
      .post('/user/create')
      .send(testUser3)
      .set('Accept', 'application/json');
    expect(response2.statusCode).toBe(403);
  });
});

describe('GET /user/login', () => {
  it('should throw error when given wrong query', async () => {
    const response = await request
      .get('/user/login')
      .query({username: ''})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(400);
  });

  it('should throw error when logging in as unverified user', async () => {
    const response = await request
      .get('/user/login')
      .query({username: testUserStudent.email,
        password: testUserStudent.password})
      .set('Accept', 'application/json');
    // console.log(response.statusCode);
    expect(response.statusCode).toBe(401);
    expect(tokens.tokens.length).toBe(0);
  });

  it('should login a verified user with correct credentials', async () => {
    const response = await request
      .get('/user/login')
      .query({username: testUserStudentVerified.email,
        password: testUserStudentVerified.password})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);
    expect(tokens.tokens.length).toBe(1);
  });

  it('should throw error when details do not match', async () => {
    const response = await request
      .get('/user/login')
      .query({username: testUserStudentVerified.email,
        password: 'wrongpassword'})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(403);
    expect(tokens.tokens.length).toBe(1);
    const response2 = await request
      .get('/user/login')
      .query({username: 'wrong@email.com',
        password: testUserStudentVerified.password})
      .set('Accept', 'application/json');
    expect(response2.statusCode).toBe(404);
    expect(tokens.tokens.length).toBe(1);
  });

  it('should re-assign token upon new log in with correct creds', async () => {
    const response = await request
      .get('/user/login')
      .query({username: testUserStudentVerified.email,
        password: testUserStudentVerified.password})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);
    expect(tokens.tokens.length).toBe(1);
    tokens.remove(tokens.tokens[0].token);
  });
});

describe('GET /user/sendCode', () => {
  it('should throw error when given wrong query', async () => {
    const response = await request
      .get('/user/sendCode')
      .query({username: ''})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(400);
  });

  it('should throw error when given wrong user', async () => {
    const response = await request
      .get('/user/sendCode')
      .query({username: 'wrong@email.com'})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(404);
  });

  it('should send an email when given correct user', async () => {
    const response = await request
      .get('/user/sendCode')
      .query({username: testUserStudent.email})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);
    expect(tokens.tokens.length).toBe(0);
  });
});

describe('POST /user/verify', () => {
  it('should throw error when given wrong query', async () => {
    const response = await request
      .post('/user/verify')
      .send({username: testUserStudent.email})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(400);
  });

  it('should throw error when given wrong user', async () => {
    const response = await request
      .post('/user/verify')
      .send({username: 'wrong@email.com',
        verificationCode: 123456})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(404);
  });

  it('should send an email when given correct user', async () => {
    const response = await request
      .post('/user/verify')
      .send({username: testUserStudent.email,
        verificationCode: 123456})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);
    expect(tokens.tokens.length).toBe(0);
  });

  it('should throw error when code is wrong', async () => {
    const response = await request
      .post('/user/verify')
      .send({username: testUserStudent.email,
        verificationCode: 123867})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(403);
    expect(tokens.tokens.length).toBe(0);
  });
});

describe('GET /user/get', () => {
  it('should throw error when given wrong query', async () => {
    const response = await request
      .get('/user/get')
      .query({username: testUserStudent.email})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(400);
  });

  it('should throw error when token is invalid', async () => {
    const response = await request
      .get('/user/get')
      .query({username: testUserStudent.email,
        token: 'randomtoken'})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(498);
  });

  it('should throw error when username is wrong', async () => {
    const response = await request
      .get('/user/get')
      .query({username: 'wrong@email.com',
        token: 'mocked-token'})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(404);
  });

  it('should throw error for trying to use Admin access', async () => {
    const response = await request
      .get('/user/get')
      .query({username: testUserStudentVerified.email,
        token: 'mocked-token2'})
      .set('Accept', 'application/json');
    // code 403 because Admin access is required
    expect(response.statusCode).toBe(403);
  });

  it('should return the requested user when all checks pass', async () => {
    let response = await request
      .get('/user/get')
      .query({token: 'mocked-token2'})
      .set('Accept', 'application/json');
    // code 403 because Admin access is required
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      email: testUserStudent.email,
      firstName: testUserStudent.firstName,
      lastName: testUserStudent.lastName,
      role: 'N/A',
      accountStatus: 'unverified',
      notes: null
    });
    response = await request
      .get('/user/get')
      .query({username: testUserStudent.email,
        token: 'mocked-token'})
      .set('Accept', 'application/json');
    // code 403 because Admin access is required
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      email: testUserStudent.email,
      firstName: testUserStudent.firstName,
      lastName: testUserStudent.lastName,
      role: 'N/A',
      accountStatus: 'unverified',
      notes: null
    });
  });
});

describe('GET /user/logout', () => {
  it('should throw error when given wrong query', async () => {
    const response = await request
      .get('/user/logout')
      .query({username: testUserStudent.email})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(400);
  });

  it('should throw error when token is invalid', async () => {
    const response = await request
      .get('/user/logout')
      .query({token: 'randomtoken'})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(498);
  });

  it('should logout the user when token is valid', async () => {
    // Start by logging a test user in
    await request
      .get('/user/login')
      .query({username: testUserStudentVerified.email,
        password: testUserStudentVerified.password})
      .set('Accept', 'application/json');
    // Now log the user out
    const response = await request
      .get('/user/logout')
      .query({token: 'mocked-token'});
    expect(response.statusCode).toBe(200);
    expect(tokens.tokens.length).toBe(0);
  });
});

describe('DELETE /user/delete', () => {
  it('should throw error when given wrong query', async () => {
    const response = await request
      .delete('/user/delete')
      .query({username: testUserStudent.email})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(400);
  });

  it('should throw error when token is invalid', async () => {
    const response = await request
      .delete('/user/delete')
      .query({username: testUserStudentVerified.email,
        token: 'randomtoken'})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(498);
  });

  it('should throw error when username is wrong', async () => {
    const response = await request
      .delete('/user/delete')
      .query({username: 'wrong@email.com',
        token: 'mocked-token'})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(404);
  });

  it('should throw error when trying deleting without Admin perms',
    async () => {
      const response = await request
        .delete('/user/delete')
        .query({username: testUserStudent.email,
          token: 'mocked-token2'})
        .set('Accept', 'application/json');
      expect(response.statusCode).toBe(403);
    });

  it('should delete the user when all checks pass', async () => {
    const response = await request
      .delete('/user/delete')
      .query({username: testUserStudent.email,
        token: 'mocked-token'})
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);
  });
});
