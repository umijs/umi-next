#!/usr/bin/env node

import 'v8-compile-cache';
import { run } from '../dist/cli/cli.js';

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
