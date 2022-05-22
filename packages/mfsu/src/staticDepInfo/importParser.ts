// @ts-ignore
import { parse as _parse } from './_importParser.js';

export default function parse(code: string): {
  from: string;
  imports: string[];
}[] {
  return _parse(code);
}
