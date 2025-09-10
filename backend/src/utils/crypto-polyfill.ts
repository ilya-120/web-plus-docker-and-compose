import * as crypto from 'crypto';
if (typeof global.crypto === 'undefined') {
  global.crypto = crypto as any;
}
