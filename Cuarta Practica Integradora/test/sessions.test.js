import mongoose from "mongoose";
import chai from "chai";
import User from "../src/dao/classes/users.dao.js";
import config from "../src/config/config.js";
const { TEST_MONGO_URI } = config

mongoose.connect(TEST_MONGO_URI);
const expect = chai.expect;

describe("Testing Users DAO", () => {
  before(function () {
    this.usersDao = new User();
  });

  beforeEach(function () {
    mongoose.connection.collections.users.drop();
    this.timeout(5000);
  });

  it("El DAO debe poder obtener los usuarios en formato de arreglo", async function () {
    const result = await this.usersDao.get();
    expect(result).to.be.an("array");
  });

  it("El DAO debe agregar un usuario correctamente a la base de datos", async function () {
    const mockUser = {
      first_name: "Nicolas",
      last_name: "Karbiner",
      email: "nicokarby@hotmail.com",
      password: "Salta2023",
      age: "36",
      role: "premium",
    };

    const result = await this.usersDao.create(mockUser);

    expect(result._id).to.be.ok;
  });

  it("El DAO debe poder obtener un solo usuario por medio del ID o del Email", async function () {
    const mockUser = {
        first_name: "Nicolas",
        last_name: "Karbiner",
        email: "nicokarby@hotmail.com",
        password: "Salta2023",
        age: "36",
        role: "premium",
    };

    const user = await this.usersDao.create(mockUser);

    const result = await this.usersDao.getByID(user._id)
    const result2 = await this.usersDao.getByEmail(user.email)

    expect(result).to.be.ok.and.an("object")
    expect(result2).to.be.ok.and.an("object")

  });

  it("El DAO debe poder actualizar un usuario en la base de datos", async function () {
    const mockUser = {
        first_name: "Nicolas",
        last_name: "Karbiner",
        email: "nicokarby@hotmail.com",
        password: "Salta2023",
        age: "36",
        role: "premium",
    };

    const user = await this.usersDao.create(mockUser);

    const data = {
        first_name: "Marcelo",
        password: "secret"
    }

    await this.usersDao.update(user._id, data)
    const updatedUser = await this.usersDao.getByID(user._id)

    expect(updatedUser.first_name).to.be.eql(data.first_name)
    expect(updatedUser.password).to.be.eql(data.password)
  });
});