export function encodeBase64(str: string): string {
  return Buffer.from(str).toString('base64');
}

export function decodeBase64(str: string): string {
  return Buffer.from(str, 'base64').toString('ascii');
}

/*
 * Provides very simple encryption, nothing that can't be broken very easily
 * This is just to give a feel of a stronger encryption just to demotivate people to try anything further
 */
function _switch(str) {
  let out = '';
  for (const c of str) {
    if (c >= 'a' && c <= 'z') {
      out += String.fromCharCode(219 - c.charCodeAt(0));
    } else if (c >= 'A' && c <= 'Z') {
      out += String.fromCharCode(155 - c.charCodeAt(0));
    } else {
      out += c;
    }
  }
  return out;
}

export function scramble(str: string): string {
  return _switch(encodeBase64(str));
}

export function scramble2(str) {
  return scramble(scramble(str));
}

export function unscramble(str) {
  return decodeBase64(_switch(str));
}

export function unscramble2(str): string {
  return unscramble(unscramble(str));
}
