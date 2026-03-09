import { Models } from '@rematch/core'; // 推导模型类型
import user from './user';
import app from './app';

export interface RootModel extends Models<RootModel> {
  user: typeof user;
  app: typeof app;
}

// 定义models实例
export const models: RootModel = { user, app };
