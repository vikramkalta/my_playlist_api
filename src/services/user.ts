import moment from 'moment';
import crypto from 'crypto';

import { User } from '../models';
import { encrypt, STATUSES, STATUS_CODES, randomGenerator, AUTH_USER_ROLES } from '../utility';
import EmailService from './email';
import { createBunyanLogger } from '../loaders/logger';

const log = createBunyanLogger('UserService');

export default class UserService {
  public async createOrGetUser(data, filterQuery) {
    try {
      const role = data.Role?.charAt(0)?.toUpperCase() + data.Role?.slice(1);
      // Adding extra validation to check if role is valid.
      if (!AUTH_USER_ROLES.includes(role)) {
        throw { message: STATUSES.badRequest + ' (Invalid role)', status: STATUS_CODES[STATUSES.badRequest] };
      }

      const result: any = { isNewUser: false };
      let user: any = await this.getUser(filterQuery);

      if (user) {
        let isNewUser = true;
        for (let i = 0; i < user.Claims?.length; i++) {
          const claim = user.Claims[i];
          if (claim.ClaimType === role) {
            isNewUser = false;
            break;
          }
        }
        result.isNewUser = isNewUser;
        // Update the Claims array.
        if (isNewUser) {
          await this.updateUser({ _id: user._id }, { $push: { Claims: { ClaimType: role } } });
        }
      } else {
        result.isNewUser = true;
        user = await this.createUser({
          Mobile: data.Mobile,
          Name: data.Name || data.Mobile,
          Username: data.Username || data.Mobile,
          Email: data.Email || `${data.Mobile}@spetrol.in`,
          MobileVerified: true,
          Claims: [{ ClaimType: role }],
        });
      }
      result.user = user;
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async getUser(filter: any) {
    try {
      if (!filter.Mobile && !filter.Email) {
        throw { message: STATUSES.badRequest + ' (Invalid field provided)', status: STATUS_CODES[STATUSES.badRequest] };
      }
      const user = await User.model.findOne({ ...filter, 'AuditInfo.Active': true }).lean();
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async createStaffUser(data) {
    try {
      data.userQuery = { Email: data.Email };
      const user = await this.createUserCommon(data, 'staff');
      // Create random password.
      const password = randomGenerator();
      log.info('Password test', password);
      const { hash, salt } = this._encryptPassword(password);
      await this.updateUser({ _id: user._id }, { Password: hash, Salt: salt });
      // Send welcome email.
      this._sendEmail({ ...data, Password: password });
      return { user };
    } catch (error) {
      throw error;
    }
  }

  public async createCustomer(data) {
    try {
      data.userQuery = { Mobile: data.Mobile };
      const user = await this.createUserCommon(data, 'customer');
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async createUserCommon(data, role) {
    try {
      // Adding extra validation to check if role is valid.
      if (!AUTH_USER_ROLES.includes(data.Role)) {
        throw { message: STATUSES.badRequest + ' (Invalid role)', status: STATUS_CODES[STATUSES.badRequest] };
      }

      let user: any = await this.getUser(data.userQuery);
      if (user) {
        throw { message: STATUSES.duplicateResource, status: STATUS_CODES[STATUSES.duplicateResource] };
      }

      user = await this.createUser({
        Mobile: data.Mobile,
        Name: data.FirstName + ' ' + data.LastName,
        Email: data.Email,
        MobileVerified: false,
        Claims: [{ ClaimType: data.Role }],
      });
      // IMPORTANT: We expect the ids of user collection in auth and customer collection in core to be same hence pass the id.
      await this._syncUserWithCore({ ...data, _id: user._id }, role, data.token);
      return user;
    } catch (error) {
      throw error;
    }
  }

  public async updateUserCommon(data, filter, role) {
    try {
      const result = await this.updateUser({ _id: filter.UserId }, data);
      delete data.Addresses;
      delete data.Documents;
      delete data.Locations;
      delete data.Vehicles;
      await this._syncUserWithCore(data, role, data.token, 'PUT');
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async updateStaffUser(data, filter) {
    try {
      const updateData: any = { ...data };
      if (data.Role) {
        updateData.Claims = [{ ClaimType: data.Role }];
      }
      const result = await this.updateUserCommon(updateData, filter, 'staff');
      return result || { success: true };
    } catch (error) {
      throw error;
    }
  }

  public async updateCustomer(data, filter) {
    try {
      const result = await this.updateUserCommon(data, filter, 'customer');
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async loginUser(data) {
    try {
      const result: any = await User.model.findOne({ Email: data.Email, 'AuditInfo.Active': true }).lean();
      if (!result) {
        throw { message: 'User not found.', status: STATUS_CODES[STATUSES.notFound] };
      }

      const isPasswordValid = this._decryptPassword(data.Password, result.Password, result.Salt);
      if (!isPasswordValid) {
        throw { message: STATUSES.unauthorized, status: STATUS_CODES[STATUSES.unauthorized] };
      }

      const dataToEncrypt = {
        Email: data.Email,
        Claims: result.Claims,
        Role: result.Claims[0].ClaimType,
        StaffId: result._id,
      };
      const { token } = this.createAuthToken(dataToEncrypt);
      delete result.Password;
      delete result.Salt;
      delete result.Claims;
      delete result.Owner;
      return { ...result, token };
    } catch (error) {
      throw error;
    }
  }

  public async createUser(data: any) {
    try {
      const user = await User.model.create(data);
      return user.toObject();
    } catch (error) {
      throw error;
    }
  }

  public async updateUser(filter, data: any) {
    try {
      const user = await User.model.findOneAndUpdate(filter, data);
      return user;
    } catch (error) {
      throw error;
    }
  }

  public createAuthToken(data) {
    data.time = moment().unix(); // seconds
    const token = encrypt(data);
    return { token };
  }

  private async _syncUserWithCore(data, role, token, method = 'POST') {
    try {
      return {};
    } catch (error) {
      throw error;
    }
  }

  private _encryptPassword(password) {
    // Generate random salt
    let length = 16;
    let salt = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    // SHA512
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return { salt, hash: hash.digest('hex') };
  }

  private _decryptPassword(password, hashedPass, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    password = hash.digest('hex');
    return password === hashedPass;
  }

  private async _sendEmail(data) {
    try {
      const emailService = new EmailService();
      await emailService.sendWelcomeEmail(data);
    } catch (error) {
      throw error;
    }
  }
}