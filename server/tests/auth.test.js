const request = require('supertest');
const app = require('../app');

describe('Auth & API Health Endpoints', () => {
  it('GET /health should return status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('OK');
  });

  it('POST /api/auth/register should validate missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'invalid@example.com',
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('required');
  });
});
