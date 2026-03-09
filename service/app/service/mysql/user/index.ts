import { Service } from 'egg';
import * as sequelize from 'sequelize';
import { UserModelIn, UserModel } from './type';

export default class AppMysqlService extends Service {
  private async getModel(): Promise<sequelize.ModelCtor<sequelize.Model<any>>> {
    const tableName = 'user';
    // 使用 any 绕过 Sequelize 版本类型冲突问题
    const model = (this.app.model as any).define(tableName, UserModel as any);
    const isExist = await this.service.redis.cache.getTableIsCreate(tableName);
    if (!isExist) {
      await model.sync();
      await this.service.redis.cache.setTableIsCreate(tableName);
    }
    return model;
  }

  async createUser(data: Omit<UserModelIn, 'status' | 'id'>) {
    const model = await this.getModel();
    await model.create({
      ...data,
      status: 1,
    });

  }

  async findUser(data: Partial<UserModelIn>) {
    const model = await this.getModel();
    const result = await model.findOne({
      where: {
        ...data,
      },
    });
    return result?.toJSON() as UserModelIn;
  }
}
