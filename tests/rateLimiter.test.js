const request = require('supertest');
const express = require('express');
const rateLimiter = require('../src/middlewares/rateLimiter');
const app = express();

app.use(express.json());
app.use(rateLimiter);

app.get('/test-rate-limiter', (req, res) => {
    res.status(200).send('Request successful');
});

describe('Rate Limiter Middleware', () => {
    it('should allow up to 5 requests per minute', async () => {
        for (let i = 0; i < 5; i++) {
            const response = await request(app).get('/test-rate-limiter');
            expect(response.status).toBe(200);
            expect(response.text).toBe('Request successful');
        }
    });

    it('should block requests after exceeding the limit', async () => {
        for (let i = 0; i < 5; i++) {
            await request(app).get('/test-rate-limiter');
        }

        const response = await request(app).get('/test-rate-limiter');
        expect(response.status).toBe(429);
        expect(response.text).toBe('Too many requests from this IP, please try again after sometime.');
    });
});