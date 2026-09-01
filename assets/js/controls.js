// update controls from settings
document.addEventListener('settings', event => {
  document.querySelectorAll(`[data-event="${event.detail.group}:${event.detail.key}"]`).forEach(control => {
    if (control.type === 'checkbox') {
      control.checked = event.detail.value === 'on';
    } else if (control.type === 'radio') {
      control.checked = control.value === event.detail.value;
    } else {
      control.value = event.detail.value;
    }
  });
});