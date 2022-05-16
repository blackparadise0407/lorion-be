import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Document, FilterQuery, Model, QueryOptions } from 'mongoose';

type QueryCondition<T> = Partial<Record<keyof T, unknown>>;

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
    conditions: QueryCondition<T> = {},
    projection: string | Record<string, unknown> = {},
    options: QueryOptions<T> = {},
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

  public async updateOne(
    conditions: QueryCondition<T> = {},
    payload: DeepPartial<T>,
  ): Promise<TDoc> {
    try {
      return this._model.findOneAndUpdate(
        conditions as FilterQuery<T>,
        {
          $set: payload,
        },
        { new: true },
      );
    } catch (e: any) {
      this._logger.error(e.message);
      throw new InternalServerErrorException();
    }
  }

  public async deleteOne(conditions: QueryCondition<T> = {}): Promise<boolean> {
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

  public async deleteMany(conditions: QueryCondition<T> = {}): Promise<void> {
    try {
      await this._model.deleteMany(conditions as FilterQuery<T>);
    } catch (e: any) {
      this._logger.error(e.message);
      throw new InternalServerErrorException();
    }
  }
}
