import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    const clientID =
      configService.get<string>('FACEBOOK_APP_ID') || 'dummy-facebook-app-id';
    const clientSecret =
      configService.get<string>('FACEBOOK_APP_SECRET') ||
      'dummy-facebook-app-secret';
    const callbackURL =
      configService.get<string>('FACEBOOK_CALLBACK_URL') ||
      'http://localhost:3000/auth/facebook/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'public_profile'],
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile._json;

    const user = {
      email: emails[0].value,
      full_name: name,
      profile_picture_url: photos[0].value,
      social_provider: 'facebook',
      social_provider_id: profile.id,
    };

    done(null, user);
  }
}
