import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) { 
        const result = await this.authService.register(registerDto);
        if (result.success && result.data?.token) {
            res.cookie('token', result.data.token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
        }
        return result;
    }

    @Post("login")
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) { 
        const result = await this.authService.login(loginDto);
        if (result.success && result.data?.token) {
            res.cookie('token', result.data.token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
        }
        return result;
    }

    @Post("logout")
    async logout(@Res({ passthrough: true }) res: Response) { 
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });
        return await this.authService.logout();
    }
}
