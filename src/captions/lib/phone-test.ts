// Phone testing: the full editor stays hidden on narrow screens unless this phone opted in
// on /ai-caption/phone-check, so its real behaviour can be seen before a phone design exists.
const KEY = 'cwaya-phone-test';

export function phoneTestOn() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setPhoneTest(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    // Nothing to remember it in.
  }
}
