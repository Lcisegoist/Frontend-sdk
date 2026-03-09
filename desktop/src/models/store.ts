import { init, RematchDispatch, RematchRootState } from '@rematch/core';
import { models, RootModel } from './index';

export const store = init({
  models,
  redux: {
    devtoolOptions: {
      name: 'blubiu-desktop',
    },
  },
});

export type Store = typeof store
// 根据RootModel定义的模型类型，推导出Dispatch类型
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
