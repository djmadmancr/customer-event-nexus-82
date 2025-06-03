
// Security utility functions for input validation and sanitization

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra minúscula' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra mayúscula' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos un número' };
  }
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters and trim whitespace
  return input.replace(/[<>'"&]/g, '').trim();
};

export const validateName = (name: string): { isValid: boolean; message?: string } => {
  const sanitizedName = sanitizeInput(name);
  
  if (sanitizedName.length < 2) {
    return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  if (sanitizedName.length > 50) {
    return { isValid: false, message: 'El nombre no puede exceder 50 caracteres' };
  }
  
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(sanitizedName)) {
    return { isValid: false, message: 'El nombre solo puede contener letras y espacios' };
  }
  
  return { isValid: true };
};

// Rate limiting for authentication attempts
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts = 5;
  private windowMs = 15 * 60 * 1000; // 15 minutes

  canAttempt(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Check if max attempts exceeded
    if (record.count >= this.maxAttempts) {
      return false;
    }

    // Increment attempt count
    record.count++;
    record.lastAttempt = now;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || record.count < this.maxAttempts) {
      return 0;
    }

    const elapsed = Date.now() - record.lastAttempt;
    return Math.max(0, this.windowMs - elapsed);
  }
}

export const authRateLimiter = new RateLimiter();

// Session management utilities
export const generateSecureId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const isValidSession = (sessionData: any): boolean => {
  if (!sessionData || typeof sessionData !== 'object') {
    return false;
  }

  const requiredFields = ['uid', 'email'];
  return requiredFields.every(field => sessionData[field]);
};

// Data encryption utilities (basic implementation for demo)
export const encryptData = (data: string): string => {
  // In a real application, use proper encryption libraries
  // This is a basic encoding for demo purposes
  return btoa(data);
};

export const decryptData = (encryptedData: string): string => {
  try {
    return atob(encryptedData);
  } catch {
    return '';
  }
};
