import { BaseDatabase } from 'admin-bro'
import { firestore } from 'firebase-admin'
import Firestore = firestore.Firestore;

class Database extends BaseDatabase {
    private readonly firestore: Firestore;

    constructor(connection: Firestore) {
      super(connection)
      this.firestore = connection
    }

    static isAdapterFor(connection: Firestore | any) : boolean {
      return connection instanceof Firestore
    }
}

export default Database
