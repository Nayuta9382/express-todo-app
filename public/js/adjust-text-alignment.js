function adjustTextAlignment() {
    const el = document.querySelector('#red-message');

   if (!el) return;

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const height = el.offsetHeight;

    // 改行してるかどうかを判定（1行の高さより高ければ改行あり）
    if (height > lineHeight + 1) {
        el.classList.remove('text-end');
        el.classList.add('text-start');
    } else {
        el.classList.remove('text-start');
        el.classList.add('text-end');
    }
}

// 初回＆リサイズ時に実行
window.addEventListener('load', adjustTextAlignment);
window.addEventListener('resize', adjustTextAlignment);