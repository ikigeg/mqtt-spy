import Redactyl from 'redactyl.js';

const redactyl = new Redactyl({
  properties: ['Admin Password', 'password', 'Join Password', 'SuperAdminPassword'],
});
  
export default (payload: string | undefined = undefined) => {
  if (!payload || payload.charAt(0) !== '{') {
    return payload;
  }
  try {
    const payloadAsJson = JSON.parse(payload);
    const redacted = redactyl.redact(payloadAsJson);
    return JSON.stringify(redacted);
  } catch (err) {
    console.log('Error redacting payload', payload);
    return payload;
  }
};
