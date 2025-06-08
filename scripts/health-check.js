const http = require('http');

const checkEndpoint = (host, port, path = '/', name) => {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ ${name} (${host}:${port}) - Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ ${name} (${host}:${port}) - Error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${name} (${host}:${port}) - Timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

const main = async () => {
  console.log('🔍 Jido-ka Health Check');
  console.log('========================');
  
  const results = await Promise.all([
    checkEndpoint('localhost', 3000, '/', 'Frontend (Next.js)'),
    checkEndpoint('localhost', 8000, '/', 'Backend (FastAPI)')
  ]);

  const allHealthy = results.every(result => result);
  
  console.log('========================');
  if (allHealthy) {
    console.log('🎉 All services are running correctly!');
    console.log('📱 Frontend: http://localhost:3000');
    console.log('🔌 Backend:  http://localhost:8000');
  } else {
    console.log('⚠️  Some services are not responding.');
    console.log('💡 Try running: npm run dev');
  }
  
  process.exit(allHealthy ? 0 : 1);
};

main(); 