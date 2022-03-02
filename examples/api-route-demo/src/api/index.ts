import { UmiApiRequest, UmiApiResponse } from 'umi';

export default function (req: UmiApiRequest, res: UmiApiResponse) {
  console.log(req.pathName);
  res.status(200).json({ hello: 'world' });
}
