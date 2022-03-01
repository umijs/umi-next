export default function (req: any, res: any) {
  const name = req.query.name;
  res.status(200).json({ message: 'Hello, ' + name });
}
