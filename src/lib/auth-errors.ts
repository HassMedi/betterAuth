import { isAPIError } from "better-auth/api";

/**
 * Maps a thrown Better Auth error to one of the user-facing messages documented
 * in `auth.docx`. Falls back to the error's own message when no mapping exists.
 */
export function mapAuthError(error: unknown): string {
  if (isAPIError(error)) {
    const code = (error.body as { code?: string } | undefined)?.code;
    const status = error.statusCode;
    const message =
      (error.body as { message?: string } | undefined)?.message?.toLowerCase() ??
      "";

    switch (code) {
      case "USER_ALREADY_EXISTS":
      case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      case "EMAIL_ALREADY_EXISTS":
        return "An account with this email already exists.";
      case "INVALID_EMAIL":
        return "Please enter a valid email address.";
      case "PASSWORD_TOO_SHORT":
      case "INVALID_PASSWORD":
      case "WEAK_PASSWORD":
        return "Password must be at least 8 characters long.";
      case "PASSWORDS_DO_NOT_MATCH":
      case "PASSWORD_CONFIRMATION_MISMATCH":
        return "Password confirmation does not match.";
      case "INVALID_EMAIL_OR_PASSWORD":
      case "CREDENTIAL_ACCOUNT_NOT_FOUND":
      case "USER_NOT_FOUND":
      case "INVALID_CREDENTIALS":
        return "Incorrect email or password.";
      case "EMAIL_NOT_VERIFIED":
        return "Your email address is not verified yet.";
      case "EMAIL_ALREADY_VERIFIED":
      case "USER_ALREADY_VERIFIED":
        return "This account is already verified.";
      case "INVALID_TOKEN":
      case "TOKEN_EXPIRED":
      case "INVALID_VERIFICATION_TOKEN":
      case "VERIFICATION_TOKEN_EXPIRED":
      case "INVALID_RESET_TOKEN":
      case "RESET_TOKEN_EXPIRED":
        // Could be verification or reset token depending on context
        if (message.includes("reset")) {
          return "This password reset link is invalid or has expired.";
        }
        return "This verification link is invalid or has expired.";
      case "TOKEN_REUSED":
      case "RESET_TOKEN_REUSED":
        return "This password reset link is invalid or has expired.";
      case "SESSION_EXPIRED":
      case "REFRESH_TOKEN_EXPIRED":
      case "REFRESH_TOKEN_REVOKED":
        return "Your session has expired. Please log in again.";
      case "MISSING_TOKEN":
        return "Authentication required.";
      case "INVALID_SIGNATURE":
      case "INVALID_AUTH_TOKEN":
        return "Invalid authentication token.";
      case "MISSING_FIELD":
      case "MISSING_FIELDS":
        if (message.includes("email")) {
          return "The email field is required.";
        }
        if (message.includes("password")) {
          return "The password field is required.";
        }
        return "Please fill in all required fields.";
      case "VALIDATION_ERROR":
        if (message.includes("email")) {
          return "Please enter a valid email address.";
        }
        if (message.includes("password") && message.includes("match")) {
          return "Password confirmation does not match.";
        }
        if (message.includes("password") && message.includes("8")) {
          return "Password must be at least 8 characters long.";
        }
        if (message.includes("password") && message.includes("different")) {
          return "New password must be different from the current password.";
        }
        if (message.includes("current password")) {
          return "Current password is incorrect.";
        }
        return "Please check your input and try again.";
      case "ACCOUNT_DISABLED":
      case "ACCOUNT_LOCKED":
      case "USER_DISABLED":
        return "Your account has been disabled. Contact support.";
      case "INSUFFICIENT_PERMISSIONS":
      case "FORBIDDEN":
        if (message.includes("permission")) {
          return "You do not have permission to perform this action.";
        }
        if (message.includes("owner") || message.includes("resource")) {
          return "You are not allowed to access this resource.";
        }
        return "You do not have permission to perform this action.";
      case "WRONG_PASSWORD":
      case "INCORRECT_CURRENT_PASSWORD":
        return "Current password is incorrect.";
      case "SAME_PASSWORD":
      case "PASSWORD_SAME_AS_OLD":
        return "New password must be different from the current password.";
      case "RATE_LIMIT_EXCEEDED":
      case "TOO_MANY_REQUESTS":
        return "Too many login attempts. Please try again in 15 minutes.";
    }

    // Status code based fallbacks
    if (status === 400) {
      if (message.includes("reset")) {
        return "This password reset link is invalid or has expired.";
      }
      if (message.includes("verification")) {
        return "This verification link is invalid or has expired.";
      }
      return "This link is invalid or has expired.";
    }
    if (status === 401) {
      if (message.includes("session")) {
        return "Your session has expired. Please log in again.";
      }
      if (message.includes("token")) {
        return "Invalid authentication token.";
      }
      if (message.includes("disabled") || message.includes("locked")) {
        return "Your account has been disabled. Contact support.";
      }
      if (message.includes("current password")) {
        return "Current password is incorrect.";
      }
      return "Authentication required.";
    }
    if (status === 403) {
      if (message.includes("disabled") || message.includes("locked")) {
        return "Your account has been disabled. Contact support.";
      }
      if (message.includes("permission")) {
        return "You do not have permission to perform this action.";
      }
      if (message.includes("owner") || message.includes("resource")) {
        return "You are not allowed to access this resource.";
      }
      return "Your account has been disabled. Contact support.";
    }
    if (status === 409) {
      if (message.includes("verified")) {
        return "This account is already verified.";
      }
      return "An account with this email already exists.";
    }
    if (status === 422) {
      if (message.includes("email") && message.includes("valid")) {
        return "Please enter a valid email address.";
      }
      if (message.includes("email") && message.includes("required")) {
        return "The email field is required.";
      }
      if (message.includes("password") && message.includes("required")) {
        return "The password field is required.";
      }
      if (message.includes("password") && message.includes("match")) {
        return "Password confirmation does not match.";
      }
      if (message.includes("password") && message.includes("8")) {
        return "Password must be at least 8 characters long.";
      }
      if (message.includes("different")) {
        return "New password must be different from the current password.";
      }
      if (message.includes("current password")) {
        return "Current password is incorrect.";
      }
      return "Please check your input and try again.";
    }
    if (status === 429) {
      return "Too many login attempts. Please try again in 15 minutes.";
    }
  }

  if (error instanceof Error && error.message) {
    const msg = error.message.toLowerCase();
    if (msg.includes("email") && msg.includes("already")) {
      return "An account with this email already exists.";
    }
    if (msg.includes("invalid email")) {
      return "Please enter a valid email address.";
    }
    if (msg.includes("password") && msg.includes("8")) {
      return "Password must be at least 8 characters long.";
    }
    if (msg.includes("password") && msg.includes("match")) {
      return "Password confirmation does not match.";
    }
    if (msg.includes("email field") && msg.includes("required")) {
      return "The email field is required.";
    }
    if (msg.includes("password field") && msg.includes("required")) {
      return "The password field is required.";
    }
    if (msg.includes("incorrect email or password")) {
      return "Incorrect email or password.";
    }
    if (msg.includes("disabled")) {
      return "Your account has been disabled. Contact support.";
    }
    if (msg.includes("verification") && (msg.includes("invalid") || msg.includes("expired"))) {
      return "This verification link is invalid or has expired.";
    }
    if (msg.includes("verified")) {
      return "This account is already verified.";
    }
    if (msg.includes("reset") && (msg.includes("invalid") || msg.includes("expired"))) {
      return "This password reset link is invalid or has expired.";
    }
    if (msg.includes("session") && msg.includes("expired")) {
      return "Your session has expired. Please log in again.";
    }
    if (msg.includes("authentication required")) {
      return "Authentication required.";
    }
    if (msg.includes("invalid authentication token")) {
      return "Invalid authentication token.";
    }
    if (msg.includes("permission")) {
      return "You do not have permission to perform this action.";
    }
    if (msg.includes("owner") || msg.includes("resource")) {
      return "You are not allowed to access this resource.";
    }
    if (msg.includes("too many")) {
      return "Too many login attempts. Please try again in 15 minutes.";
    }
    if (msg.includes("current password")) {
      return "Current password is incorrect.";
    }
    if (msg.includes("different from")) {
      return "New password must be different from the current password.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}