export class UserWithoutPassword {
  id: number;
  username: string;
  updatedDate: Date;
  lastLogin: Date;
  hashRefreshToken: string;
}

export class UserM extends UserWithoutPassword {
  password: string;
}
