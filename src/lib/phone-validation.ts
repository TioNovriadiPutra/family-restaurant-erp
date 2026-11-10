// Accept local mobile format or country code 62, without separators.
export const indonesianMobilePattern = /^(?:08|628)[1-9]\d{7,10}$/;
export const phoneValidationMessage = "Gunakan nomor HP Indonesia berawalan 08 (10–13 angka) atau 628 (11–14 angka).";
export const phoneDigits = (value: string) => value.replace(/\D/g, "");
export const validIndonesianPhone = (value: string) => value === "" || indonesianMobilePattern.test(value);
