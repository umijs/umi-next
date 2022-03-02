import { UmiApiRequest, UmiApiResponse } from 'umi';

// This is an example middleware of new API route feature in Umi 4.
export default function (req: UmiApiRequest, res: UmiApiResponse, next: any) {
  console.log(req);
  console.log(res);
  next();
}
