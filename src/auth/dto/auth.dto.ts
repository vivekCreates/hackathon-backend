export class RegisterDto {
  email!: string;
  name!: string;
  password!: string;
  role!: "PARTICIPANT" | "ORGANIZER" | "ADMIN";
}

export class LoginDto {
  email!: string;
  password!: string;
}
