const baseUrl = 'http://localhost:3005/todos'; // 設定 API 的基本 URL，方便後續的 API 請求使用。若後端改 port 或部署到其他主機，需修改此處

// 以下 querySelector 是用來抓取 HTML 中對應 class 的元素，並將其存儲在變數中，以便後續操作這些元素
const todoForm = document.querySelector('.todo-form');
const todoInput = document.querySelector('.todo-input');
const todosList = document.querySelector('.todos-list');
const statusEl = document.querySelector('.status');
const clearBtn = document.querySelector('.clear-btn');

async function fetchTodos() { // 定義一個非同步函式來獲取待辦事項列表
    try {
        const res = await fetch(baseUrl); // fetch 是用來發送 HTTP 請求的函式，會返回一個 Promise 物件；await 是用來等待 Promise 物件完成的關鍵字，當 fetch 完成後，res 就會是 fetch 返回的 Response 物件
        const data = await res.json(); // 將格式化為 JSON 物件；並使用 await 等待解析完成
        return data.data || []; // 從後端返回的 JSON 物件中取出 data 屬性，這裡假設後端返回的格式是 { status: 'success', data: [...] }；如 data 不存在，則回傳一個空陣列。為何可知後端返回的格式？因為在 server.js 中，當成功處理請求時，會回傳一個 JSON 物件，其中包含 status 和 data 屬性。
    } catch (err) { // setStatus 是用來顯示給使用者看的訊息，而 console.error 是用來顯示給開發者看的訊息。當錯誤被 catch 捕捉到，會存儲在 err 變數中。
        console.error(err); // 在控制台輸出錯誤訊息，方便開發者調試。為何不是寫 console.log？因為 console.error 會以錯誤的格式顯示訊息，通常會有紅色字體和堆疊追蹤，讓開發者更容易識別和定位問題。
        setStatus('無法取得待辦，請確認後端是否啟動。');
        return []; // 當發生錯誤時，回傳一個空陣列，讓後續的程式碼可以正常運行，而不會因為沒有資料而出錯。
    }
}

function setStatus(msg, isError = true) { // 定義一個函式來設置狀態訊息，接受兩個參數：msg 是要顯示的訊息內容，isError 是一個布林值，預設為 true，表示這是一個錯誤訊息
    statusEl.textContent = msg;
    statusEl.style.color = isError ? 'crimson' : 'green'; // 根據 isError 的值來決定訊息的顏色，如果是錯誤訊息則顯示紅色(crimson)，否則顯示綠色(green)
}

function clearStatus() {
    statusEl.textContent = ''; // 清空狀態訊息的內容，讓使用者界面不再顯示任何訊息
}

function renderTodos(todos) { // 會把伺服器回傳的 data（陣列）渲染到 #todosList，每個項目會產生編輯/刪除按鈕。todos 是一個陣列，包含所有待辦事項，每個待辦事項都是一個物件，具有 id 和 title 屬性。
    todosList.innerHTML = ''; // 在渲染新的待辦事項列表之前，先清空 #todosList 的內容，以免重複顯示舊的待辦事項。這樣做可以確保每次渲染都是基於最新的資料。
    if (!todos.length) { // 當陣列是空的，todos.length 為 0 時，!todos.length (非0，not false) 的值為 true，則顯示訊息告訴使用者目前沒有待辦事項。
        todosList.innerHTML = '<li class="empty">目前沒有待辦事項</li>';
        return;
    }
    todos.forEach(todo => { // createElement 製作 HTML 標籤，用累加的方式讓待辦事項顯示在使用者界面上。
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = todo.id; // 使用 dataset 屬性將 todo 的 id (todo.id) 存儲在 li 元素的 data-id 屬性中，這樣在後續的操作中可以方便地獲取該 id 來進行編輯或刪除等操作。todo.id 是從後端返回的每個待辦事項物件中的 id 屬性，這個 id 是唯一的，可以用來識別每個待辦事項。li有哪些屬性？className 是用來設定 li 元素的 CSS 類別，這裡設定為 'todo-item'；dataset 是一個 DOMStringMap 物件，用來存儲自定義的 data-* 屬性，這裡使用 data-id 來存儲 todo 的 id。

        const span = document.createElement('span');
        span.textContent = todo.title;

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = '編輯';
        editBtn.addEventListener('click', () => editTodo(todo.id, todo.title));

        const delBtn = document.createElement('button');
        delBtn.textContent = '刪除';
        delBtn.addEventListener('click', () => deleteTodo(todo.id));

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        li.appendChild(span);
        li.appendChild(actions);
        todosList.appendChild(li);
    });
}

async function refresh() {
    clearStatus();
    const todos = await fetchTodos();
    renderTodos(todos);
}

async function addTodo(title) { // 對 POST/todos 發 request，body { "title": "..."} ，新增後端會回傳更新後的 data（todos 陣列）。
    try {
        const res = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        const data = await res.json();
        if (res.ok) {
            renderTodos(data.data || []);
            setStatus('新增成功', false);
            setTimeout(clearStatus, 1500);
        } else {
            setStatus('新增失敗');
        }
    } catch (err) {
        console.error(err);
        setStatus('新增失敗，請稍後重試');
    }
}

async function deleteTodo(id) { // 對 DELETE/todos/{id} 發 request，刪除單筆，伺服器回傳更新後的列表。
    if (!confirm('確定要刪除此待辦？')) return;
    try {
        const res = await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            renderTodos(data.data || []);
            setStatus('刪除成功', false);
            setTimeout(clearStatus, 1200);
        } else {
            setStatus('刪除失敗');
        }
    } catch (err) {
        console.error(err);
        setStatus('刪除失敗');
    }
}

async function clearAll() { // 對 DELETE/todos 發 request（無 body），清空全部。
    if (!confirm('確定要清除全部待辦？')) return;
    try {
        const res = await fetch(baseUrl, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            renderTodos(data.data || []);
            setStatus('已清除全部', false);
            setTimeout(clearStatus, 1200);
        } else {
            setStatus('清除失敗');
        }
    } catch (err) {
        console.error(err);
        setStatus('清除失敗');
    }
}

async function editTodo(id, currentTitle) { // 對 PATCH/todos/{id} 發 request，body { "title": "..."} ，更新指定項目。
    const newTitle = prompt('編輯待辦內容：', currentTitle);
    if (newTitle === null) return; // user cancelled
    if (newTitle.trim() === '') {
        alert('標題不可為空');
        return;
    }
    try {
        const res = await fetch(`${baseUrl}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle })
        });
        const data = await res.json();
        if (res.ok) {
            renderTodos(data.data || []);
            setStatus('更新成功', false);
            setTimeout(clearStatus, 1200);
        } else {
            setStatus('更新失敗');
        }
    } catch (err) {
        console.error(err);
        setStatus('更新失敗');
    }
}

todoForm.addEventListener('submit', (e) => { // 為 todoForm 表單添加 submit 事件監聽器，當使用者提交表單時會觸發這個事件處理函式。e 是事件物件，代表這次事件的相關資訊。
    e.preventDefault();
    const v = todoInput.value.trim();
    if (!v) return alert('請輸入待辦事項');
    addTodo(v);
    todoInput.value = '';
});

clearBtn.addEventListener('click', clearAll);

document.addEventListener('DOMContentLoaded', () => { // 為 document 添加 DOMContentLoaded 事件監聽器，當整個 HTML 文件被完全加載和解析完成後會觸發這個事件處理函式。這確保了在執行其他 JavaScript 代碼之前，DOM 已經準備就緒。
    refresh();
});