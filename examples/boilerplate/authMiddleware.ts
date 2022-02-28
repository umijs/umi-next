// This is an example middleware of new API route feature in Umi 4.
export default function (req: any, res: any, next: any) {
  console.log(req);
  console.log(res);
  next();
}
