const taskList = document.querySelector('#task-list-item');
const taskTitle = document.querySelector('#task-title');

function checkTaskListHeight() {
    if (taskList && taskList.offsetHeight === 200) {
        taskTitle.classList.add('mr-5');
    } else {
        taskTitle.classList.remove('mr-5');
    }
}

// 初回実行（ページ読み込み時）
checkTaskListHeight();

// ウィンドウサイズ変更時にも実行
window.addEventListener('resize', checkTaskListHeight);
