import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 }
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01']
    }
};

const BASE_URL = __ENV.BASE_URL || 'https://jsonplaceholder.typicode.com';

export default function () {
    const responses = http.batch([
        ['GET', `${BASE_URL}/posts`],
        ['GET', `${BASE_URL}/posts/1`],
        ['POST', `${BASE_URL}/posts`, JSON.stringify({ title: 'load test', body: 'content', userId: 1 }), { headers: { 'Content-Type': 'application/json' } }]
    ]);
    responses.forEach(res => {
        check(res, {
            'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
            'response time < 500ms': (r) => r.timings.duration < 500
        });
    });
    sleep(1);
}
