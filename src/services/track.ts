import { Track } from '../models';
import { ITrack } from '../interfaces/track';

export default class UserService {
  public async createTrack(data: ITrack): Promise<ITrack> {
    const result = await Track.model.create(data);
    return result.toJSON();
  }

  public async getTracks(): Promise<ITrack[]> {
    const result = await Track.model.find({ 'auditInfo.active': true }).lean();
    return result;
  }

  public async updateTrack(filter, data): Promise<ITrack> {
    const result = await Track.model.findOneAndUpdate(filter, data);
    return result;
  }

  public async deleteTrack(filter): Promise<{success: boolean}> {
    await Track.model.deleteOne(filter);
    return { success: true };
  }
}