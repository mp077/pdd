const http = require('http');

const data = JSON.stringify({
  username: 'admin@dentpulse.com',
  password: 'admin123',
  device_info: 'test'
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => { console.log('Status:', res.statusCode); console.log('Body:', body); });
});

req.on('error', error => { console.error('Error:', error); });
req.write(data);
req.end();
