import { UmiApiRequest, UmiApiResponse } from 'umi';

export default function (req: UmiApiRequest, res: UmiApiResponse) {
  console.log(req.pathName);
  res.status(201).json({ result: true });
}
