import { AppConfig, User, Email, UserRoles } from '../../src/models';

export const cleanupDb = async (): Promise<void> => {
  try {
    await AppConfig.model.deleteMany();
    await User.model.deleteMany();
    await Email.model.deleteMany();
    await UserRoles.model.deleteMany();
  } catch (error) {
    console.log('Something went wrong while cleaning up db');
  }
};