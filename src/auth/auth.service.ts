import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';
import { sendSuccessResponse } from '../utils/sendSuccess.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) {}

    async register(registerDto: RegisterDto) {
        const { name, email, password, role = "PARTICIPANT" } = registerDto;
        try {
            if (!name || !email || !password) {
                return {
                    statusCode: 400,
                    message: "Missing required fields",
                    data: null,
                    success: false
                };
            }

            const userExists = await this.prisma.user.findUnique({
                where: { email },
            });

            if (userExists) {
                return {
                    statusCode: 400,
                    message: "User already exists",
                    data: null,
                    success: false
                };
            }

            const hashed = await bcrypt.hash(password, 10);
            const user = await this.prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashed,
                    role,
                },
            });

            const { password: _, ...userWithoutPassword } = user;
            
            const payload = { sub: user.id, email: user.email, role: user.role };
            const token = await this.jwtService.signAsync(payload);

            return sendSuccessResponse(201, "User registered successfully", {
                user: userWithoutPassword,
                token
            });
        } catch (err: any) {
            return {
                statusCode: 500,
                message: err.message || "Internal server error",
                data: null,
                success: false
            };
        }
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        try {
            if (!email || !password) {
                return {
                    statusCode: 400,
                    message: "Missing required fields",
                    data: null,
                    success: false
                };
            }

            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return {
                    statusCode: 401,
                    message: "Invalid credentials",
                    data: null,
                    success: false
                };
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return {
                    statusCode: 401,
                    message: "Invalid credentials",
                    data: null,
                    success: false
                };
            }

            const { password: _, ...userWithoutPassword } = user;

            const payload = { sub: user.id, email: user.email, role: user.role };
            const token = await this.jwtService.signAsync(payload);

            return sendSuccessResponse(200, "Login successful", {
                user: userWithoutPassword,
                token
            });
        } catch (err: any) {
            return {
                statusCode: 500,
                message: err.message || "Internal server error",
                data: null,
                success: false
            };
        }
    }

    async logout() {
        return sendSuccessResponse(200, "Logout successful", null);
    }
}
