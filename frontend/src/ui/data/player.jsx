export function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validateLogin(values) {
  const errors = {};
  if (!validEmail(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.password) errors.password = 'Enter your password.';
  return errors;
}

export function validatePlayer(values) {
  const errors = {};
  if (!values.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!validEmail(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.password) errors.password = 'Enter a password.';
  if (!values.confirmPassword || values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords must match.';
  if (!values.football && !values.cricket) errors.sports = 'Select at least one sport.';
  if (values.football && !values.primaryPosition) errors.primaryPosition = 'Choose your primary football position.';
  if (values.cricket && !values.cricketRole) errors.cricketRole = 'Choose your primary cricket role.';
  return errors;
}
