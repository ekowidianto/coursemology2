import { AxiosError } from 'axios';

import GlobalUsersAPI from 'api/Users';
import { TimeZones } from 'types/course/admin/course';
import {
  EmailData,
  EmailPostData,
  EmailsData,
  PasswordData,
  PasswordPostData,
  ProfileData,
  ProfilePostData,
} from 'types/users';

export type AccountSettingsData = ProfileData & EmailsData & PasswordData;

const PASSWORD_TEMPLATE: PasswordData = {
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
};

/**
 * Fetches profile and emails data, then returns them and an empty password template.
 */
export const fetchAccountSettings = async (): Promise<AccountSettingsData> => {
  const profile = GlobalUsersAPI.users.fetchProfile();
  const emails = GlobalUsersAPI.users.fetchEmails();
  const [profileResponse, emailsResponse] = await Promise.all([
    profile,
    emails,
  ]);

  const profileData = profileResponse.data;
  const emailsData = emailsResponse.data;

  return { ...profileData, ...emailsData, ...PASSWORD_TEMPLATE };
};

export const updateProfile = async (
  data: Partial<ProfileData>,
): Promise<Partial<ProfileData> | undefined> => {
  if (!data.name && !data.timezone) return undefined;

  const adaptedData: ProfilePostData = {
    user: {
      name: data.name,
      time_zone: data.timezone,
    },
  };

  try {
    const response = await GlobalUsersAPI.users.updateProfile(adaptedData);
    return { name: response.data.name, timezone: response.data.timezone };
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const updatePassword = async (
  data: Partial<PasswordData>,
): Promise<PasswordData | undefined> => {
  if (!data.currentPassword && !data.password && !data.passwordConfirmation)
    return undefined;

  const adaptedData: PasswordPostData = {
    user: {
      current_password: data.currentPassword,
      password: data.password,
      password_confirmation: data.passwordConfirmation,
    },
  };

  try {
    await GlobalUsersAPI.users.updatePassword(adaptedData);
    return PASSWORD_TEMPLATE;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

/**
 * Updates profile data (except the profile photo) and password, then returns the new
 * updated profile data, along with an empty password template and original `emails`.
 */
export const updateAccountSettings = async (
  data: Partial<AccountSettingsData>,
): Promise<Partial<AccountSettingsData>> => {
  const profileUpdate = updateProfile(data);
  const passwordUpdate = updatePassword(data);

  const responses = await Promise.all([profileUpdate, passwordUpdate]);
  return Object.assign({}, ...responses);
};

export const updateProfilePicture = async (
  image: Blob,
): Promise<Partial<ProfileData>> => {
  const file = new File([image], 'image.jpeg', { type: image.type });

  try {
    const response = await GlobalUsersAPI.users.updateProfilePicture(file);
    return { imageUrl: response.data.imageUrl };
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.errors?.profile_photo);

    throw error;
  }
};

export const fetchTimeZones = async (): Promise<TimeZones> => {
  const response = await GlobalUsersAPI.users.fetchTimeZones();
  return response.data;
};

export const addEmail = async (
  email: EmailData['email'],
): Promise<EmailsData> => {
  const adaptedData: EmailPostData = { user_email: { email } };

  try {
    const response = await GlobalUsersAPI.users.addEmail(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const removeEmail = async (id: EmailData['id']): Promise<EmailsData> => {
  try {
    const response = await GlobalUsersAPI.users.removeEmail(id);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const setEmailAsPrimary = async (
  url: NonNullable<EmailData['setPrimaryUserEmailPath']>,
): Promise<EmailsData> => {
  try {
    const response = await GlobalUsersAPI.users.setEmailAsPrimary(url);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const resendConfirmationEmail = async (
  url: NonNullable<EmailData['confirmationEmailPath']>,
): Promise<void> => {
  try {
    await GlobalUsersAPI.users.resendConfirmationEmail(url);
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
