import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Document, FilterQuery, Model } from 'mongoose';

export abstract class BaseService<T, TDoc = T & Document> {
  private readonly _logger: Logger;
  private readonly _model: Model<TDoc>;

  constructor(model: Model<TDoc>) {
    this._logger = new Logger(model.modelName);
    this._model = model;
  }

  public get model(): Model<TDoc> {
    return this._model;
  }

  public async getOne(
    conditions: Partial<Record<keyof T, unknown>> = {},
    projection: string | Record<string, unknown> = {},
    options: Record<string, unknown> = {},
  ): Promise<TDoc> {
    try {
      return this._model.findOne(
        conditions as FilterQuery<T>,
        projection,
        options,
      );
    } catch (e: any) {
      this._logger.error(e.message);
      throw new InternalServerErrorException();
    }
  }

  public async createOne(payload: DeepPartial<T>): Promise<TDoc> {
    try {
      return this._model.create(payload);
    } catch (e: any) {
      this._logger.error(e.message);
      throw new InternalServerErrorException();
    }
  }

  public async deleteOne(
    conditions: Partial<Record<keyof T, unknown>> = {},
  ): Promise<boolean> {
    try {
      const { deletedCount } = await this._model.deleteOne(
        conditions as FilterQuery<T>,
      );
      return deletedCount > 0;
    } catch (e: any) {
      this._logger.error(e.message);
      throw new InternalServerErrorException();
    }
  }
}
