import moment from 'moment';
import crypto from 'crypto';

import { User } from '../models';
import { encrypt, STATUSES, STATUS_CODES } from '../utility';
import EmailService from './email';
// import { createBunyanLogger } from '../loaders/logger';
import { IUser } from '../interfaces/user';

// const log = createBunyanLogger('UserService');

interface ITokenResult {
  token: string;
}

interface IHashResult {
  salt: string;
  hash: string;
}

export default class UserService {
  public async createOrGetUser(data: IUser): Promise<IUser> {
    const user = await User.model.findOne({ $or: [{ email: data.email }, { username: data.username }] });
    if (user) {
      throw { message: STATUSES.badRequest + ' (User with same email already exists)', status: STATUS_CODES[STATUSES.badRequest] };
    }
    const { hash, salt } = this._encryptPassword(data.password);
    data.salt = salt;
    data.password = hash;
    const newUser: IUser = (await User.model.create(data)).toObject();
    const { token } = this.createAuthToken({ email: data.email });
    delete newUser.password;
    delete newUser.salt;
    this._sendEmail(newUser);
    newUser.token = token;
    return newUser;
  }

  // User with same username should not exist.
  public async checkUsername(data: IUser): Promise<{ success: boolean }> {
    const user = await User.model.findOne({ username: data.username });
    if (user) {
      throw { message: STATUSES.badRequest + ' (Username already exists)', status: STATUS_CODES[STATUSES.badRequest] };
    }
    return { success: true };
  }

  public async getUser(filter: { email: string }): Promise<IUser> {
    const user = await User.model.findOne({ email: filter.email, 'auditInfo.active': true }).lean();
    return user;
  }

  public async loginUser(data): Promise<IUser> {
    const result: IUser = await User.model.findOne({ Email: data.Email, 'AuditInfo.Active': true }).lean();
    if (!result) {
      throw { message: 'User not found.', status: STATUS_CODES[STATUSES.notFound] };
    }

    const isPasswordValid = this._decryptPassword(data.password, result.password, result.salt);
    if (!isPasswordValid) {
      throw { message: STATUSES.unauthorized, status: STATUS_CODES[STATUSES.unauthorized] };
    }

    const dataToEncrypt = {
      email: data.email,
      // claims: result.claims,
      // role: result.claims[0].claimType,
    };
    const { token } = this.createAuthToken(dataToEncrypt);
    delete result.password;
    delete result.salt;
    delete result.claims;
    delete result.owner;
    return { ...result, token };
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