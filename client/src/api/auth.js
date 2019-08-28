import Http from './../utils/Http';

export function getApiLogin(data) {
  return new Http().post('/login', data);
}

export function register(data) {
  return new Http().post('/signup', data);
}

export function apiChangePassword(data) {
  return new Http().authenticated().post('/change-password', data);
}

export function sendMailResetPassword(data) {
  return new Http().post('/send-mail-reset-password', data);
}

export function resetPassword(data) {
  return new Http().post('/reset-password', data);
}

export function confirmEmail(data) {
  const { id, active_token } = data;

  return new Http().get('/confirm/' + id + '/' + active_token);
}

export function resendEmail(data) {
  return new Http().post('/resend-active-email', data);
}

export function checkResetPasswordToken(token) {
  return new Http().get(`/users/check-reset-password-token?token=${token}`);
}

export function resendActiveMail(email) {
  return new Http().post('/resend-active-mail', email);
}
