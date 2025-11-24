import * as OTPAuth from "otpauth";

export function buildOtpUrl({
  title,
  secret,
  issuer,
}: {
  title: string;
  secret: string;
  username?: string;
  issuer?: string;
}): string | false {
  const finalIssuer = issuer || title;
  let otpUrl = `otpauth://totp/${finalIssuer}?secret=${secret}`;
  if (issuer) {
    otpUrl += `&issuer=${issuer}`;
  }
  try {
    // see if it's a valid otp url and can be parsed
    const totp = OTPAuth.URI.parse(otpUrl);
    // we want Exception to be thrown if it's not valid
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const token = totp.generate();
    return otpUrl;
  } catch (e) {
    console.error(e);
    // failed to build otp url
    return false;
  }
}
export function parseOtpUrl(
  otpUrl: string
): OTPAuth.HOTP | OTPAuth.TOTP | null {
  try {
    const totp = OTPAuth.URI.parse(otpUrl);
    return totp;
  } catch (e) {
    return null;
  }
}


