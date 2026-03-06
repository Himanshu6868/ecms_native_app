const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email.trim());

export const getRequiredError = (value: string): string | undefined =>
  value.trim().length === 0 ? 'This field is required' : undefined;

export const getEmailError = (email: string): string | undefined => {
  const requiredError = getRequiredError(email);
  if (requiredError) {
    return requiredError;
  }

  if (!isValidEmail(email)) {
    return 'Enter a valid email address';
  }

  return undefined;
};

export const getPasswordError = (password: string): string | undefined => {
  const requiredError = getRequiredError(password);
  if (requiredError) {
    return requiredError;
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return undefined;
};
