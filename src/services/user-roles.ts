import { IMinimalResponse, IUser, IUserRoles } from '../interfaces';
import { UserRoles } from '../models';
import { STATUSES, STATUS_CODES } from '../utility';

export default class UserRoleService {
  public async createUserRole(data): Promise<IUser> {
    const result = await UserRoles.model.create(data);
    return result.toObject();
  }

  public async getUserRole(filter): Promise<IUserRoles> {
    filter['AuditInfo.Active'] = true;
    const result = await UserRoles.model.findOne(filter);
    if (!result) {
      throw {
        message: STATUSES.notFound,
        status: STATUS_CODES[STATUSES.notFound]
      };
    }
    return result.toObject();
  }

  public async getUserRoles(): Promise<IUserRoles[]> {
    const result = await UserRoles.model.find({ 'AuditInfo.Active': true });
    return result;
  }

  public async updateUserRole(filter, data): Promise<IUserRoles> {
    let result;
    if (data.Permission) {
      result = await UserRoles.model.updateOne(filter, {
        $push: { Permissions: data.Permission }
      });
    } else {
      result = await UserRoles.model.updateOne(filter, data);
    }
    return result;
  }

  public async updatePermissions(filter, data): Promise<IMinimalResponse> {
    await UserRoles.model.updateOne(filter, {
      $push: { Permissions: data }
    });
    return { success: true };
  }

  public async deleteUserRole(filter): Promise<IMinimalResponse> {
    await UserRoles.model.updateOne(filter, { 'AuditInfo.Active': false });
    return { success: true };
  }
}