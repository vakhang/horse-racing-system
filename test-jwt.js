const crypto = require('crypto');

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const header = { alg: 'HS256', typ: 'JWT' };
// Assuming JwtUtils.java puts username in subject and maybe some claims
// JwtUtils.java line 20: return Jwts.builder().setSubject(userDetails.getUsername()).setIssuedAt(new Date()).setExpiration(new Date((new Date()).getTime() + EXPIRE_DURATION)).signWith(key).compact();
const payload = { sub: 'admin@gmail.com', iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 3600 };

const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));

const signature = crypto.createHmac('sha256', 'HorseRacingVnSuperSecretKey2026-HorseRacingVnSuperSecretKey2026!')
  .update(encodedHeader + '.' + encodedPayload)
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const token = encodedHeader + '.' + encodedPayload + '.' + signature;
console.log(token);
