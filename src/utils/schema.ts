import BaseProperty, { PropertyType } from 'admin-bro/types/src/backend/adapters/property/base-property'

type FirestoreSchemaParam = {
    type: PropertyType,
    isSortable: boolean
}

export interface Schema {
    [path: string]: FirestoreSchemaParam,
}

export function convertToProperty(path: string, property: FirestoreSchemaParam): BaseProperty {
  return new BaseProperty({
    path,
    isId: path === 'id',
    type: property.type,
    isSortable: property.isSortable,
  })
}
