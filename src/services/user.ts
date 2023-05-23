import moment from 'moment';
import crypto from 'crypto';

import { User } from '../models';
import { encrypt, STATUSES, STATUS_CODES, randomGenerator, AUTH_USER_ROLES } from '../utility';
import EmailService from './email';
import { createBunyanLogger } from '../loaders/logger';
import { IUser } from '../interfaces/user';
import { IMinimalResponse } from '../interfaces';

const log = createBunyanLogger('UserService');

interface IUserResult {
  isNewUser?: boolean;
  user?: IUser;
}

interface ITokenResult {
  token: string;
}

interface IHashResult {
  salt: string;
  hash: string;
}

export default class UserService {
  public async createOrGetUser(data, filterQuery): Promise<IUserResult> {
    const role = data.Role?.charAt(0)?.toUpperCase() + data.Role?.slice(1);
    // Adding extra validation to check if role is valid.
    if (!AUTH_USER_ROLES.includes(role)) {
      throw { message: STATUSES.badRequest + ' (Invalid role)', status: STATUS_CODES[STATUSES.badRequest] };
    }

    const result: IUserResult = { isNewUser: false };
    let user: IUser = await this.getUser(filterQuery);

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
  }

  public async getUser(filter): Promise<IUser> {
    if (!filter.Mobile && !filter.Email) {
      throw { message: STATUSES.badRequest + ' (Invalid field provided)', status: STATUS_CODES[STATUSES.badRequest] };
    }
    const user = await User.model.findOne({ ...filter, 'AuditInfo.Active': true }).lean();
    return user;
  }

  public async createStaffUser(data): Promise<IUserResult> {
    data.userQuery = { Email: data.Email };
    const user = await this.createUserCommon(data);
    // Create random password.
    const password = randomGenerator();
    log.info('Password test', password);
    const { hash, salt } = this._encryptPassword(password);
    await this.updateUser({ _id: user._id }, { Password: hash, Salt: salt });
    // Send welcome email.
    this._sendEmail({ ...data, Password: password });
    return { user };
  }

  public async createCustomer(data): Promise<IUser> {
    data.userQuery = { Mobile: data.Mobile };
    return await this.createUserCommon(data);
  }

  public async createUserCommon(data): Promise<IUser> {
    // Adding extra validation to check if role is valid.
    if (!AUTH_USER_ROLES.includes(data.Role)) {
      throw { message: STATUSES.badRequest + ' (Invalid role)', status: STATUS_CODES[STATUSES.badRequest] };
    }

    let user: IUser = await this.getUser(data.userQuery);
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
    return user;
  }

  public async updateUserCommon(data, filter): Promise<IUser> {
    const result = await this.updateUser({ _id: filter.UserId }, data);
    delete data.Addresses;
    delete data.Documents;
    delete data.Locations;
    delete data.Vehicles;
    return result;
  }

  public async updateStaffUser(data, filter): Promise<IUser|IMinimalResponse> {
    const updateData: IUser = { ...data };
    if (data.Role) {
      updateData.Claims = [{ ClaimType: data.Role }];
    }
    const result = await this.updateUserCommon(updateData, filter);
    return result || { success: true };
  }

  public async updateCustomer(data, filter): Promise<IUser> {
    const result = await this.updateUserCommon(data, filter);
    return result;
  }

  public async loginUser(data): Promise<IUser> {
    const result: IUser = await User.model.findOne({ Email: data.Email, 'AuditInfo.Active': true }).lean();
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
  }

  public async createUser(data): Promise<IUser> {
    const user = await User.model.create(data);
    return user.toObject();
  }

  public async updateUser(filter, data): Promise<IUser> {
    const user = await User.model.findOneAndUpdate(filter, data);
    return user;
  }

  public createAuthToken(data): ITokenResult {
    data.time = moment().unix(); // seconds
    const token = encrypt(data);
    return { token };
  }

  private _encryptPassword(password): IHashResult {
    // Generate random salt
    const length = 16;
    const salt = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    // SHA512
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return { salt, hash: hash.digest('hex') };
  }

  private _decryptPassword(password, hashedPass, salt): boolean {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    password = hash.digest('hex');
    return password === hashedPass;
  }

  private async _sendEmail(data): Promise<void> {
    const emailService = new EmailService();
    await emailService.sendWelcomeEmail(data);
  }
}