document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[name$="-obfs_pass"]').forEach(function (el) {
    if (el.dataset.obfsGenerateInit) return;
    el.dataset.obfsGenerateInit = '1';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'button';
    btn.style.marginLeft = '8px';
    btn.textContent = '随机生成';
    btn.addEventListener('click', function () {
      var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var result = '';
      for (var i = 0; i < 24; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      el.value = result;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    var wrapper = el.parentElement;
    if (wrapper) {
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.appendChild(btn);
    }
  });
});
