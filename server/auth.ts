import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import { type Express } from "express";

export function setupAuth(app: Express) {
  // Required for Passport to work, even if we handle sessions manually downstream
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user: any, done) => done(null, user));

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  // Use Render's external URL or fallback to localhost
  const BASE_URL = process.env.RENDER_EXTERNAL_URL || "http://localhost:5000";

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET env variables. Google Login will act as a simulation or fail.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/google/callback`,
      },
      async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0].value;
          const firstName = profile.name?.givenName || "User";
          const lastName = profile.name?.familyName || "";
          const photo = profile.photos?.[0].value;

          if (!email) {
            return done(new Error("No email found from Google account"), undefined);
          }

          // 1. Try finding by Google ID
          let user = await storage.getUserByGoogleId(googleId);

          if (!user) {
            // 2. Try finding by email (account linking or legacy)
            user = await storage.getUserByEmail(email);

            if (!user) {
              // 3. Create new user if neither exists
              user = await storage.createUser({
                email,
                googleId,
                firstName,
                lastName,
                profileImageUrl: photo,
              });
            } else {
              // User exists with email but no googleId.
              // In a perfect world, we update the user to add googleId.
              // For now, allow login.
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );

  app.use(passport.initialize());
  console.log("✅ Passport Google Strategy configured");
}
