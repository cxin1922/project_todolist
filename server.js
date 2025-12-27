const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errHandle = require('./errorHandle');
const todos = [];

// 監聽：要去接收下面函式的資料
const requestListener = (req, res) => { //去接請求和回應
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*', // 允許跨網域請求：允許所有網域的請求，讓其他伺服器/IP 都可以造訪
        'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE', // 允許的請求方法
        'Content-Type': 'application/json' // 用 json 格式解析 (接請求和回應)
    }

    let body = "";
    req.on('data', chunk => {
        body += chunk;
    })

    if (req.url == "/todos" && req.method == "GET") { // 偵測首頁
        res.writeHead(200, headers);
        // res.write 符合前述提及用 JSON 格式解析(寫物件格式)，但在此須把物件格式轉為字串，才可以造訪
        res.write(JSON.stringify({
            "status": "success", // 狀態成功
            "data": todos, // 無資料要給造訪者，所以寫空陣列
        }));
        res.end();
    } else if (req.url == "/todos" && req.method == "POST") { // 偵測 POST API
        req.on('end', () => { // on end 代表有吃到資料，已確保 body 有資料
            // 用 try-catch 判斷是否為物件格式
            try {
                const title = JSON.parse(body).title; // 把 body 從字串轉成物件格式，並抓出 title (若抓不到則 title 會是 undefined)

                // 用 if 判斷物件是否具有 title 屬性
                if (title !== undefined) {
                    const todo = {
                        "title": title,
                        "id": uuidv4(),
                    }
                    todos.push(todo); // 把 todo 物件放進 todos 陣列裡面；在此是記在記憶體上
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                } else {
                    errHandle(res);
                }
            } catch (error) {
                errHandle(res);
            }
        })
    } else if (req.url == "/todos" && req.method == "DELETE") { // 刪除全部資料
        todos.length = 0; // 清空陣列
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
    } else if (req.url.startsWith("/todos/") && req.method == "DELETE") { // 刪除單筆待辦資料
        const id = req.url.split("/").pop(); // 取得網址最後的 id (單筆待辦)
        const index = todos.findIndex(element => element.id == id); // index 等於一個值，代表那個 id 在原本 todos 陣列中的位置

        // 判斷 todo id 是否存在於 todos 陣列中(該陣列中的每個物件，皆有 "title" 和 "id" 屬性)
        if (index !== -1) {
            todos.splice(index, 1); // 在 todos 陣列中，從 index 這個位置開始算起，刪除 1 個元素 (也就是那一個 todo 物件)
            res.writeHead(200, headers);
            res.write(JSON.stringify({
                "status": "success",
                "data": todos,
            }));
            res.end();
        } else {
            errHandle(res);
        }
    } else if (req.url.startsWith("/todos/") && req.method == "PATCH") { // 編輯單筆待辦
        req.on('end', () => { // 確保接收到 body 資料
            // 用 try-catch 判斷是否為 JSON 物件格式
            try {
                const title = JSON.parse(body).title; // 把 body 從字串轉成物件格式，並取出內文 (title)；若非物件，會是 undefined
                const id = req.url.split('/').pop(); // 取出 id
                const index = todos.findIndex(element => element.id == id); // todos 有 id 和 title 兩欄位，比對 todos 中的 id(element.id) 和 req.url 傳來的id，抓出id在todos中的索引號

                // 判斷是否存在 title、判斷 todo id 是否存在於 todos 陣列中("否" 則 index = -1)
                if (title !== undefined && index !== -1) {
                    todos[index].title = title; // 用 index 抓出該筆 todo 物件，並把 title 屬性改成新的 title
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                } else {
                    errHandle(res);
                }
            } catch {
                errHandle(res);
            }
        })
    } else if (req.method == "OPTIONS") { // 偵測預檢請求
        res.writeHead(200, headers);
        res.end()
    }
    else { // 偵測非首頁
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "false", // 狀態失敗
            "message": "無此網站路由", // 提示錯誤訊息
        }));
        res.end();
    }
}

// createServer 希望帶入函式監聽 requestListener 進去，所以上面要補一個函式來接收這個監聽。這個監聽是當今天有使用者造訪網頁(事件)，就會被監聽，看是否有觸發要執行的函式 
const server = http.createServer(requestListener);
server.listen(3005); // (先在終端機打上 node server.js) 網頁上輸入 http://127.0.0.1:3005 就會觸發監聽事件，執行 requestListener 裡面的程式碼而顯示 hello 文字在網頁上


"// test" 
"// test" 
