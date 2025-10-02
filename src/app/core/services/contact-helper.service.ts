import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContactHelperService {

  /**
   * Generate WhatsApp link for a phone number
   * @param phoneNumber The phone number (can include country code or not)
   * @param message Optional pre-filled message
   * @returns WhatsApp URL
   */
  generateWhatsAppLink(phoneNumber: string, message?: string): string {
    // Clean the phone number (remove spaces, dashes, etc.)
    let cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Add Saudi Arabia country code if not present
    if (!cleanNumber.startsWith('+') && !cleanNumber.startsWith('966')) {
      if (cleanNumber.startsWith('0')) {
        cleanNumber = '966' + cleanNumber.substring(1);
      } else {
        cleanNumber = '966' + cleanNumber;
      }
    }
    
    // Remove + if present for WhatsApp format
    cleanNumber = cleanNumber.replace('+', '');
    
    let whatsappUrl = `https://wa.me/${cleanNumber}`;
    
    if (message) {
      const encodedMessage = encodeURIComponent(message);
      whatsappUrl += `?text=${encodedMessage}`;
    }
    
    return whatsappUrl;
  }

  /**
   * Generate phone call link
   * @param phoneNumber The phone number
   * @returns tel: URL for phone calls
   */
  generateCallLink(phoneNumber: string): string {
    // Clean the phone number
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    return `tel:${cleanNumber}`;
  }

  /**
   * Format phone number for display (Saudi format)
   * @param phoneNumber Raw phone number
   * @returns Formatted phone number
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Clean the number
    let cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Remove country code for display if present
    if (cleanNumber.startsWith('966')) {
      cleanNumber = '0' + cleanNumber.substring(3);
    } else if (cleanNumber.startsWith('+966')) {
      cleanNumber = '0' + cleanNumber.substring(4);
    }
    
    // Format as: 0XX XXX XXXX
    if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
      return `${cleanNumber.substring(0, 3)} ${cleanNumber.substring(3, 6)} ${cleanNumber.substring(6)}`;
    }
    
    return phoneNumber; // Return original if can't format
  }

  /**
   * Validate Saudi phone number
   * @param phoneNumber Phone number to validate
   * @returns true if valid Saudi phone number
   */
  isValidSaudiPhoneNumber(phoneNumber: string): boolean {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Saudi mobile numbers start with 05 and are 10 digits total
    const saudiMobileRegex = /^(05|5)[0-9]{8}$/;
    
    // Also check with country code
    const saudiMobileWithCodeRegex = /^(\+?966)(5)[0-9]{8}$/;
    
    return saudiMobileRegex.test(cleanNumber) || saudiMobileWithCodeRegex.test(cleanNumber);
  }

  /**
   * Open contact method (WhatsApp or Call)
   * @param contactMethod The contact method ('WhatsApp' or 'Call')
   * @param phoneNumber The phone number
   * @param adTitle Optional ad title for WhatsApp message
   */
  openContact(contactMethod: 'WhatsApp' | 'Call', phoneNumber: string, adTitle?: string): void {
    if (!phoneNumber) {
      console.error('Phone number is required');
      return;
    }

    let url: string;
    
    if (contactMethod === 'WhatsApp') {
      const message = adTitle ? `مرحباً، أنا مهتم بإعلانك: ${adTitle}` : 'مرحباً، أنا مهتم بإعلانك';
      url = this.generateWhatsAppLink(phoneNumber, message);
    } else {
      url = this.generateCallLink(phoneNumber);
    }

    // Open in new tab/window
    window.open(url, '_blank');
  }
}
