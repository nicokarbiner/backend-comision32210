export default class UserInfoDTO {
  constructor(user) {
    this.first_name = user.first_name
    this.last_name = user.last_name
    this.email = user.email
    this.role = user.role
    this.last_connection = user.last_connection
  }
}