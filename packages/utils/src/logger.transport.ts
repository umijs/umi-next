import { once } from 'events';
import fs from 'fs';
import dayjs from '../compiled/dayjs';
import * as rfs from '../compiled/rotating-file-stream';

const generator = (time: Date | number, index = 0) => {
  let date = time as Date;
  if (!date) {
    date = new Date();
  }
  return `${dayjs(date).format('YYYY-MM-DD')}-${index}.txt`;
};
async function transport(opts: Required<rfs.Options>) {
  if (opts.path && !fs.existsSync(opts.path)) {
    fs.mkdirSync(opts.path, { recursive: true });
  }
  const stream = rfs.createStream(generator, opts);
  await once(stream, 'open');
  return stream;
}

module.exports = transport;
