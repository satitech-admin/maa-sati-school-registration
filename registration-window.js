// Registration is open through the 11:59 PM minute in India.
const closesAt = Date.parse('2026-12-06T00:00:00+05:30');

function updateRegistrationWindow() {
  const closed = Date.now() >= closesAt;
  document.querySelectorAll('[data-registration-panel], [data-registration-payment]').forEach(element => {
    element.hidden = closed;
  });
  document.querySelectorAll('[data-registration-closed]').forEach(element => {
    element.hidden = !closed;
  });
}

updateRegistrationWindow();
window.addEventListener('pageshow', updateRegistrationWindow);
window.setInterval(updateRegistrationWindow, 1000);
