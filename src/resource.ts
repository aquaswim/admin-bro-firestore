import { BaseRecord, BaseResource, Filter, ParamsType } from 'admin-bro'
import { get } from 'lodash'
import { firestore } from 'firebase-admin'
import BaseProperty from 'admin-bro/types/src/backend/adapters/property/base-property'
import BaseRecordFactory from './utils/base-record-factory'
import { convertToProperty, Schema } from './utils/schema'
import CollectionReference = firestore.CollectionReference;
import Query = firestore.Query;
import DocumentData = firestore.DocumentData;

interface ResourceConstructorParams {
    collection: CollectionReference,
    schema: Schema
}

class Resource extends BaseResource {
    private readonly dbType = 'Firestore';

    public readonly collection: CollectionReference;

    public readonly baseRecordFactory: BaseRecordFactory

    private readonly schema: Schema;

    constructor({ collection, schema }: ResourceConstructorParams) {
      super(collection)
      this.collection = collection
      this.baseRecordFactory = new BaseRecordFactory(this)
      this.schema = schema
    }

    static isAdapterFor(resource: CollectionReference | any): boolean {
      return resource instanceof CollectionReference
    }

    databaseName(): string {
      return this.dbType
    }

    id(): string {
      return this.collection.id
    }

    name(): string {
      return this.id()
    }

    properties(): Array<BaseProperty> {
      return Object
        .entries(this.schema)
        .map(
          ([path, schemaParam]) => convertToProperty(path, schemaParam),
        )
    }

    property(path: string): BaseProperty | null {
      const schemaParam = get(this.schema, path)
      if (schemaParam) {
        convertToProperty(path, schemaParam)
      }
      return null
    }

    async count(filter: Filter): Promise<number> {
      const cols = await this.processFilter(filter).get()
      return cols.size
    }

    async find(filter: Filter, options: { limit?: number; offset?: number; sort?: { sortBy?: string; direction?: 'asc' | 'desc' } }): Promise<Array<BaseRecord>> {
      const cols = await this.processFilter(
        filter,
        options.limit,
        options.offset,
        options.sort,
      ).get()
      return this.baseRecordFactory.collectionSnapshotToBaseRecord(cols)
    }

    async findOne(id: string): Promise<BaseRecord | null> {
      const doc = await this.collection.doc(id).get()
      return this.baseRecordFactory.documentSnapshotToBaseRecord(doc)
    }

    async findMany(ids: Array<string | number>): Promise<Array<BaseRecord>> {
      const cols = await this.collection.where(firestore.FieldPath.documentId(), 'in', ids).get()
      return this.baseRecordFactory.collectionSnapshotToBaseRecord(cols)
    }

    create(params: Record<string, any>): Promise<ParamsType> {
      return super.create(params)
    }

    update(id: string, params: Record<string, any>): Promise<ParamsType> {
      return super.update(id, params)
    }

    async delete(id: string): Promise<void> {
      await this.collection.doc(id).delete()
    }

    private processFilter(
      filter: Filter,
      limit?: number,
      offset?: number,
      sort?: { sortBy?: string; direction?: 'asc' | 'desc' },
    ):Query<DocumentData> {
      // eslint-disable-next-line no-underscore-dangle
      let _q = filter.reduce<Query<DocumentData>>(
        (q, filterElement) => {
          // eslint-disable-next-line no-underscore-dangle
          let __q = q
          if (typeof filterElement.value === 'string') {
            __q = __q.where(filterElement.path, '==', filterElement.value)
          } else if (filterElement.value.to) {
            __q = __q.where(filterElement.path, '>', filterElement.value)
          } else if (filterElement.value.from) {
            __q = __q.where(filterElement.path, '<', filterElement.value)
          }
          return __q
        },
        this.collection,
      )
      if (limit) {
        _q = _q.limit(limit)
      }
      if (offset) {
        _q = _q.offset(offset)
      }
      if (sort && sort.sortBy) {
        _q.orderBy(sort.sortBy, sort.direction)
      }
      return _q
    }
}

export default Resource
