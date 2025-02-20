import { https } from 'firebase-functions';
import fetch from 'node-fetch';

const getThreeRandomNum = () => {
  const arr = [
    100, 10, 600, 601, 99999, 10000, 10001, 2002, 55, 5582, 431, 1235,
  ];
  const indices = new Set();
  while (indices.size < 3) {
    const index = Math.floor(Math.random() * arr.length);
    indices.add(index);
  }
  return Array.from(indices).map(i => arr[i]);
};

export const proxyRavelry = https.onRequest(async (req, res) => {
  console.log('Proxy function invoked');
  try {
    const randomNums = getThreeRandomNum();
    // 외부 API URL과 query string을 동적으로 구성할 수 있음
    const targetUrl = `https://api.ravelry.com/patterns.json?ids=${randomNums[0]}+${randomNums[1]}+${randomNums[2]}`;
    console.log('Requesting URL:', targetUrl);

    // 인증 헤더를 포함한 요청 옵션
    const username = 'read-9045f7287d8e907a3144efb83afa115e';
    const password = 'hhcbTheR2CZKGZBZjJjtnL/8DC5GHJPEsKVhUYyk';
    console.log(username);
    console.log(password);
    const auth = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await fetch(targetUrl, {
      headers: {
        Authorization: `Basic ${auth}`,
        'User-Agent': 'curl/8.6.0',
      },
    });
    console.log('Received response with status:', response.status);

    // 클라이언트가 원할 경우 JSON 응답을 반환
    const data = await response.text(); // 또는 response.json() 사용 (단, 오류 처리 주의)

    // 필요한 CORS 헤더 추가
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // preflight request 처리
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).send(error.toString());
  }
});
