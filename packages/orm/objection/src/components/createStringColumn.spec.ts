import {Entity} from "@tsed/objection";
import {MaxLength, Property} from "@tsed/schema";
import {createTableStub} from "../../test/helpers/knex/table";
import {createColumns} from "../utils/createColumns";

describe("createNumberColumn", () => {
  it("should create table from a given class (with maxLength)", async () => {
    @Entity("users")
    class User {
      @Property()
      @MaxLength(200)
      prop: string;
    }

    const table = createTableStub();
    await createColumns(table, User);

    expect(table.string).toHaveBeenCalledWith("prop", 200);
  });

  it("should create table from a given class (without maxLength)", async () => {
    @Entity("users")
    class User {
      @Property()
      prop: string;
    }

    const table = createTableStub();
    await createColumns(table, User);

    expect(table.string).toHaveBeenCalledWith("prop", undefined);
  });
});
