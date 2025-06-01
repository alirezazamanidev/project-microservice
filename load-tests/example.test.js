// load-tests/profile.test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  iterations:100

};

export default function () {
  const res = http.get('http://localhost:8000/api/file/test');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

//   sleep(1);
}
