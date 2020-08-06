import {Type} from "@tsed/core";
import {JsonMapperMethods} from "../interfaces/JsonMapperMethods";

// tslint:disable-next-line:variable-name
const JsonMapperTypesContainer: Map<Type<any> | Symbol, {token: Type<JsonMapperMethods>; instance: JsonMapperMethods}> = new Map();

export function registerJsonTypeMapper(type: Type<any>, token: Type<JsonMapperMethods>) {
  JsonMapperTypesContainer.set(type, {token, instance: new token()});
}

export function getJsonMapperTypes(): Map<Type<any> | Symbol, JsonMapperMethods> {
  return new Map(
    Array.from(JsonMapperTypesContainer.entries()).map(([key, {instance}]) => {
      return [key, instance];
    })
  );
}
