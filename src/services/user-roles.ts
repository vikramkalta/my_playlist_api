import { UserRoles } from '../models';
import { STATUSES, STATUS_CODES } from '../utility';

export default class UserRoleService {
  public async createUserRole(data) {
    try {
      const result = await UserRoles.model.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async getUserRole(filter) {
    try {
      filter['AuditInfo.Active'] = true;
      const result = await UserRoles.model.findOne(filter);
      if (!result) {
        throw {
          message: STATUSES.notFound,
          status: STATUS_CODES[STATUSES.notFound]
        };
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async getUserRoles() {
    try {
      const result = await UserRoles.model.find({ 'AuditInfo.Active': true });
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async updateUserRole(filter, data) {
    try {
      let result;
      if (data.Permission) {
        result = await UserRoles.model.updateOne(filter, {
          $push: { Permissions: data.Permission }
        });
      } else {
        result = await UserRoles.model.updateOne(filter, data);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async updatePermissions(filter, data) {
    try {
      const result = await UserRoles.model.updateOne(filter, {
        $push: { Permissions: data }
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async deleteUserRole(filter) {
    try {
      const result = await UserRoles.model.updateOne(filter, { 'AuditInfo.Active': false });
      return result;
    } catch (error) {
      throw error;
    }
  }
}