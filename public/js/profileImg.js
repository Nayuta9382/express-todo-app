const fileInput = document.getElementById('profile-img-fileInput');
const preview = document.getElementById('profile-img-edit');
const imgFluidDummy= document.getElementById('img-fluid-dummy');

fileInput.addEventListener('change', (event) => {
const file = event.target.files[0];
if (!file) return;

 // 画像かどうかをチェック
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result; // 選んだ画像をプレビューにセット
        };
        reader.readAsDataURL(file);
        preview.classList.remove('none');
        imgFluidDummy.classList.add('none');
    }else{
        imgFluidDummy.classList.remove('none');
        preview.classList.add('none');
    }
});

