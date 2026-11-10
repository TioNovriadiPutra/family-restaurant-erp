export function validEmployeePin(pin: string) {
  return /^[0-9]{6}$/.test(pin) && !/^([0-9])\1{5}$/.test(pin) &&
    !"01234567890123456789".includes(pin) && !"98765432109876543210".includes(pin);
}
