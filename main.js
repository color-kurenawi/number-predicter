window.addEventListener('load', () => {
    const canvas = document.querySelector('#draw-area');
    const context = canvas.getContext('2d');

    canvasPosition = canvas.getClientRects()[0]
    
    const last = { x: null, y: null };
  
    let isDrag = false;
  
    function draw(x, y) {
      // ドラッグされていなかったら処理を中断
      if(!isDrag) {
        return;
      }
      
      // 線のプロパティ
      context.lineCap = 'round'; 
      context.lineJoin = 'round';
      context.lineWidth = 15;
      context.strokeStyle = 'black'; // 線の色
  
      // 前回の位置から現在のマウスの位置まで線を描画.
      if (last.x === null || last.y === null) {
        // ドラッグ開始時の線の開始位置
        context.moveTo(x, y);
      } else {
        // ドラッグ中の線の開始位置
        context.moveTo(last.x, last.y);
      }

      context.lineTo(x, y);
      context.stroke();
  
      // 現在のマウス位置を記録
      last.x = x;
      last.y = y;
    }
  
    // canvas上に書いた絵を全部消す
    function clear() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      let result = document.getElementById("result")
      result.innerHTML = '';
    }

    // 推論処理 APIを呼び出して結果をresultに表示
    function estimate(){
      let result = document.getElementById("result")
      xhr = new XMLHttpRequest();
      var img = canvas.toDataURL("image/png");
      // xhr.open('POST', 'http://127.0.0.1:5000/predict', true);　//　ローカル用
      xhr.open('POST', 'https://polar-mountain-63948.herokuapp.com/predict', true); // heroku用
      result.innerHTML = '少しおまちください4';
      xhr.onload = function () {
        result.innerHTML = 'レスポンス受理';
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log(xhr.response.prediction.result);
            result.innerHTML = "推定結果は" + xhr.response.prediction.result + "です";
          } else {
            console.error(xhr.statusText);
            result.innerHTML = 'なんらかのエラー';
          }
        }
      };
      xhr.responseType = "json";
      result.innerHTML = '推定中';
      xhr.send(img);
    }
    
    // ドラッグ開始と同時に線の描画開始
    function dragStart(event) {
      context.beginPath();
  
      isDrag = true;
    }
    // ドラッグ終了 or キャンバス外に移動で描画終了
    function dragEnd(event) {
      context.closePath();
      isDrag = false;
  
      // 位置の記録をリセット
      last.x = null;
      last.y = null;
    }
  
    // イベント処理の定義
    function initEventHandler() {
      const clearButton = document.querySelector('#clear-button');
      clearButton.addEventListener('click', clear);
      const estimateButton = document.querySelector('#estimate-button');
      estimateButton.addEventListener('click', estimate);
      
      // PC向けイベント
      canvas.addEventListener('mousedown', dragStart);
      canvas.addEventListener('mouseup', dragEnd);
      canvas.addEventListener('mouseout', dragEnd);
      canvas.addEventListener('mousemove', (event) => {  
        draw(event.layerX, event.layerY);
      });

      // スマホ・タブレット向けイベント
      canvas.addEventListener("touchstart",dragStart);
      canvas.addEventListener("touchend",dragEnd);
      canvas.addEventListener("touchout",dragEnd);
      function scrollX(){return document.documentElement.scrollLeft || document.body.scrollLeft;}
      function scrollY(){return document.documentElement.scrollTop || document.body.scrollTop;}
      canvas.addEventListener("touchmove",(event) => {
        let touchX = event.touches[0].clientX - canvasPosition.left + scrollX();
        let touchY = event.touches[0].clientY - canvasPosition.top + scrollY();
        console.log(touchX, touchY);
        draw(touchX, touchY);
      });
    }
  
    // イベント処理の初期化
    initEventHandler();
  });