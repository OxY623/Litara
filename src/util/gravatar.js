import gravatar from 'gravatar';

export default function getGravatar(email) {
  return gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });
}
