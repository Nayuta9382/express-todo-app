// 今日の日付を取得してセット
const now = new Date();

const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0始まりなので+1
const day = String(now.getDate()).padStart(2, '0');

const today = `${year}-${month}-${day}`;

document.getElementById('deadline').value = today;