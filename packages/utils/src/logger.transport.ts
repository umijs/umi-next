import { once } from 'events';
import fs from 'fs';
import * as rfs from 'rotating-file-stream';
const pad = (num: number) => (num > 9 ? '' : '0') + num;

const generator = (time: Date | number, index = 0) => {
  let date = time as Date;
  if (!date) {
    date = new Date();
  }
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  // const hour = pad(date.getHours());
  // const minute = pad(date.getMinutes());
  // const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day}-${index}.txt`;
};
async function transport(opts: rfs.Options) {
  if (opts.history && !fs.existsSync(opts.history)) {
    fs.mkdirSync(opts.history, { recursive: true });
  }
  const stream = rfs.createStream(generator, opts);
  await once(stream, 'open');
  return stream;
}

module.exports = transport;
