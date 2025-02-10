import request from 'supertest';
import { app, closeServer } from '../server';
import { sqlSelect } from '../SqlTestCode';

// Mocking the sqlSelect function
jest.mock('../SqlTestCode.js', () => {
  const actualModule = jest.requireActual('../SqlTestCode.js');

  return {
    ...actualModule,
    sqlSelect: jest.fn(),
  };
});

jest.mock('../bootstrap', () => ({
  ensureTables: jest.fn().mockImplementation(() => {
    return Promise.resolve();
  }),
}));

// Mock the tokens module
jest.mock('../server', () => ({
  ...jest.requireActual('../server'),
  tokens: {
    existsByToken: jest.fn((token) => {
      return token === 'mocked-token';
    }),
    getUser: jest.fn((token) => {
      return token === 'mocked-token' ? 'admin@example.com' : null;
    }),
  }
}));

describe('GET /bookings/list/:spaceID', () => {
  afterAll(async () => {
    await closeServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // it('should return all bookings for a space if the user is an admin',
  //   async () => {
  //     // Mock the token existence check
  //     tokens.existsByToken.mockReturnValue(true);
  //     tokens.getUser.mockReturnValue('admin@example.com');

  //     // Mock the user being an admin
  //     sqlSelect.mockResolvedValueOnce([{
  //       Email: 'admin@example.com', Role: 'Admin' }]);

  //     // Mock the bookings
  //     sqlSelect.mockResolvedValueOnce([
  //       { BookingID: 1, SpaceID: 1, UserEmail: 'admin@example.com',
  //         StartTime: '2024-07-26T10:00:00Z',
  //         EndTime: '2024-07-26T11:00:00Z', Notes: 'Meeting' },
  //       { BookingID: 2, SpaceID: 1, UserEmail: 'admin@example.com',
  //         StartTime: '2024-07-26T11:00:00Z',
  //         EndTime: '2024-07-26T12:00:00Z', Notes: 'Workshop' },
  //     ]);

  //     const response = await request(app)
  //       .get('/bookings/list/1')
  //       .query({ token: 'mocked-token' });

  //     expect(response.status).toBe(200);
  //     expect(response.body).toEqual([
  //       { BookingID: 1, SpaceID: 1, UserEmail: 'admin@example.com',
  //         StartTime: '2024-07-26T10:00:00Z',
  //         EndTime: '2024-07-26T11:00:00Z', Notes: 'Meeting' },
  //       { BookingID: 2, SpaceID: 1, UserEmail: 'admin@example.com',
  //         StartTime: '2024-07-26T11:00:00Z',
  //         EndTime: '2024-07-26T12:00:00Z', Notes: 'Workshop' },
  //     ]);
  //   });

  // it('should return an error if the user is not an admin', async () => {
  //   // Mock the token existence check
  //   tokens.existsByToken.mockReturnValue(true);
  //   tokens.getUser.mockReturnValue('user@example.com');

  //   // Mock the user not being an admin
  //   sqlSelect.mockResolvedValueOnce([{
  //     Email: 'user@example.com', Role: 'User' }]);

  //   const response = await request(app)
  //     .get('/bookings/list/1')
  //     .query({ token: 'mocked-token' });

  //   expect(response.status).toBe(403);
  //   expect(response.text).toBe('Admin access required for this operation');
  // });

  it('should return an error if the token is invalid', async () => {
    // Mock the token being invalid
    sqlSelect.mockResolvedValueOnce([]);

    const response = await request(app)
      .get('/bookings/list/1')
      .query({ token: 'invalid-token' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('"Invalid token"');
  });
});
