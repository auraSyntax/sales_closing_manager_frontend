import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from '@/hooks/use-toast';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates required fields in a form data object.
 * @param formData The object containing form data.
 * @param requiredFields Array of field names that are required.
 * @returns An object with error messages for missing/empty fields.
 */
export function validateRequiredFields(formData: Record<string, any>, requiredFields: string[]): Record<string, string> {
  const errors: Record<string, string> = {};
  requiredFields.forEach((field) => {
    const value = formData[field];
    if (value === undefined || value === null || value === "") {
      errors[field] = "This field is required.";
    }
  });
  return errors;
}

/**
 * Checks if a string is a valid email address (basic regex).
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Checks if a string is a valid phone number (basic, allows digits, spaces, dashes, parentheses, min 8 digits).
 */
export function isValidPhoneNumber(phone: string): boolean {
  return /^(?:\+\d{1,3}[ -]?)?(?:\(?\d{2,4}\)?[ -]?)?\d{3,4}[ -]?\d{3,4}$/.test(phone.replace(/\D/g, '')) && phone.replace(/\D/g, '').length >= 8;
}

/**
 * Show a toast message. Type can be 'success' | 'error'.
 */
export function showToast({ title, description, type = 'success' }: { title: string; description?: string; type?: 'success' | 'error' }) {
  toast({
    title,
    description,
    variant: type === 'error' ? 'destructive' : 'default',
  });
}
