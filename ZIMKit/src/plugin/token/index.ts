import CryptoJS from 'crypto-js';
export function generateToken(userID: string, seconds: number, appConfig: any): string {
  if (!userID) return '';
  // 构造 加密数据
  const time = (Date.now() / 1000) | 0;
  const body = {
    app_id: appConfig.appID,
    user_id: userID,
    nonce: (Math.random() * 2147483647) | 0,
    ctime: time,
    expire: time + (seconds || 7200),
  };
  // 加密 body
  const key = CryptoJS.enc.Utf8.parse(appConfig.serverSecret);
  let iv = Math.random().toString().substring(2, 18);
  if (iv.length < 16) iv += iv.substring(0, 16 - iv.length);

  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(body), key, {
    iv: CryptoJS.enc.Utf8.parse(iv),
  }).toString();
  const ciphert = Uint8Array.from(Array.from(atob(ciphertext)).map((val) => val.charCodeAt(0)));
  const len_ciphert = ciphert.length;

  // 组装 token 数据
  const uint8 = new Uint8Array(8 + 2 + 16 + 2 + len_ciphert);
  // expire: 8
  uint8.set([0, 0, 0, 0]);
  uint8.set(new Uint8Array(Int32Array.from([body.expire]).buffer).reverse(), 4);
  // iv length: 2
  uint8[8] = iv.length >> 8;
  uint8[9] = iv.length - (uint8[8] << 8);
  // iv: 16
  uint8.set(Uint8Array.from(Array.from(iv).map((val) => val.charCodeAt(0))), 10);
  // 密文 length: 2
  uint8[26] = len_ciphert >> 8;
  uint8[27] = len_ciphert - (uint8[26] << 8);
  // 密文
  uint8.set(ciphert, 28);

  const token = `04${btoa(String.fromCharCode(...Array.from(uint8)))}`;

  return token;
}
export function getToken(userID: string, appConfig: { appID: number; serverSecret: string; tokenURL: string }): Promise<string> {
  return fetch(appConfig.tokenURL + userID)
    .then((res) => res.json())
    .then((res) => {
      return res.token;
    });
}
