const fileInput = document.getElementById('profile-img-fileInput');
const preview = document.getElementById('profile-img-edit');

fileInput.addEventListener('change', (event) => {
const file = event.target.files[0];
if (!file) return;

const reader = new FileReader();
reader.onload = (e) => {
    preview.src = e.target.result; // 選んだ画像をプレビューにセット
};
reader.readAsDataURL(file);
});

