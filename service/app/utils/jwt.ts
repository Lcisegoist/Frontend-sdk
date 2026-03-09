import jwt from 'jsonwebtoken';


const SecretKey = 'blubiu-secret-key';

export const getJwtTokenMsg = <T>(token: string): Promise<T> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, SecretKey, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as T);
      }
    });
  });


export const creatJwtToken = (msg: any) => jwt.sign(msg, SecretKey, { expiresIn: '1d' });

