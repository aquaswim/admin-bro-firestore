import { firestore } from 'firebase-admin/lib/firestore'
import BaseRecord from 'admin-bro/types/src/backend/adapters/record/base-record'
import Resource from '../resource'
import DocumentSnapshot = firestore.DocumentSnapshot;
import DocumentData = firestore.DocumentData;
import QuerySnapshot = firestore.QuerySnapshot;

class BaseRecordFactory {
    private readonly resource: Resource;

    // eslint-disable-next-line no-useless-constructor
    constructor(resource: Resource) {
      this.resource = resource
    }

    documentSnapshotToBaseRecord(doc: DocumentSnapshot): BaseRecord | null {
      if (!doc.exists) {
        return null
      }
      const data:DocumentData = doc.data() || {}
      // do some transform here
      return new BaseRecord(
        {
          ...data,
          id: doc.id,
        },
        this.resource,
      )
    }

    collectionSnapshotToBaseRecord(col: QuerySnapshot<DocumentData>): BaseRecord[] {
      const result: BaseRecord[] = []
      col.forEach((doc) => {
        const baseRecord = this.documentSnapshotToBaseRecord(doc)
        if (baseRecord) {
          result.push(baseRecord)
        }
      })
      return result
    }
}

export default BaseRecordFactory
