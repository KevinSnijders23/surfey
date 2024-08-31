import { defineFakeRoute } from 'vite-plugin-fake-server/client';

const userInfo = {
  name: 'Surfey',
  userid: '00000001',
  email: '1531733886@qq.com',
  signature: 'Bitcoin',
  introduction: 'Lambo',
  title: 'god',
  token: '',
  power: 'admin',
};

export default defineFakeRoute([
  {
    url: '/mock_api/login',
    timeout: 1000,
    method: 'post',
    response: ({ body }: { body: Recordable }) => {
      const { username, password } = body;
      if (username === 'bitcoin' && password === 'bitcoin') {
        userInfo.token = genID(16);
        return {
          data: userInfo,
          code: 1,
          message: 'ok',
        };
      } else {
        return {
          data: null,
          code: -1,
          message: 'Access denied',
        };
      }
    },
    // rawResponse: async (req, res) => {
    //   console.log(req, res);
    //   let reqbody = {};
    //   res.setHeader('Content-Type', 'application/json');
    //   reqbody = { data: userInfo };
    //   res.statusCode = 500;
    //   res.end(JSON.stringify(reqbody));
    // },
  },
  {
    url: '/mock_api/getUserInfo',
    timeout: 1000,
    method: 'get',
    response: () => {
      return userInfo;
    },
  },
]);

function genID(length: number) {
  return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
}
