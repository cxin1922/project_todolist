function errHandle(res) {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*', // 允許跨網域請求：允許所有網域的請求，讓其他伺服器/IP 都可以造訪
        'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE', // 允許的請求方法
        'Content-Type': 'application/json' // 用 json 格式解析 (接請求和回應)
        // "Content-Type": "text/plain" // 用文字格式來接請求和回應
    }
    res.writeHead(400, headers); // headers 定義在 server.js 內
    res.write(JSON.stringify({
        "status": "false",
        "message": "欄位未填寫正確，或無此 todo id",
    }));
    res.end();
}

// 因為 Node.js 的檔案是「各自獨立的模組」，需主動匯出（export）在 errorHandle.js 裡面宣告的東西，即導出 errHandle 這個函式對外公開，讓其他檔案可取用
module.exports = errHandle; 