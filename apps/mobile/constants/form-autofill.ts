import type { TextInputProps } from 'react-native';

/** Shared autofill hints for AppInput (web + mobile). */
export type AutofillPreset = Pick<TextInputProps, 'autoComplete' | 'textContentType'> & {
  name: string;
};

export const AUTOFILL = {
  loginEmail: {
    name: 'username',
    autoComplete: 'username',
    textContentType: 'emailAddress',
  },
  email: {
    name: 'email',
    autoComplete: 'email',
    textContentType: 'emailAddress',
  },
  currentPassword: {
    name: 'current-password',
    autoComplete: 'current-password',
    textContentType: 'password',
  },
  newPassword: {
    name: 'new-password',
    autoComplete: 'new-password',
    textContentType: 'newPassword',
  },
  name: {
    name: 'name',
    autoComplete: 'name',
    textContentType: 'name',
  },
  tel: {
    name: 'tel',
    autoComplete: 'tel',
    textContentType: 'telephoneNumber',
  },
  streetAddress: {
    name: 'street-address',
    autoComplete: 'street-address',
    textContentType: 'fullStreetAddress',
  },
  off: {
    name: 'off',
    autoComplete: 'off',
  },
} satisfies Record<string, AutofillPreset>;
