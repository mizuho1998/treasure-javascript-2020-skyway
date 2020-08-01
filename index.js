(async function(){
    console.log("hello treasure");
    let localStream;
    let dataConnection

    const localText = document.getElementById('js-local-text');
    const sendTrigger = document.getElementById('js-send-trigger');
    const messages = document.getElementById('js-messages');
    const meta = document.getElementById('js-meta');
    
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoElement = document.getElementById('my-video');
        videoElement.srcObject = localStream;
        videoElement.play();
    } catch(error) {
        alert(error);
    }

    const peer = new Peer({
        key: 'a40fde66-0ac5-4525-87b8-9f77b16b5bbd',
        debug: 3
    });

    peer.on('open', () => {
        document.getElementById('my-id').textContent = peer.id;
    });

    // 発信処理
    document.getElementById('make-call').onclick = () => {
        const theirID = document.getElementById('their-id').value;
        const mediaConnection = peer.call(theirID, localStream);

        dataConnection = peer.connect(theirID);

        dataConnection.once('open', async () => {
            messages.textContent += `=== DataConnection has been opened ===\n`;
      
            sendTrigger.addEventListener('click', onClickSend);
          });
      
          dataConnection.on('data', data => {
            messages.textContent += `Remote: ${data}\n`;
          });
      
          dataConnection.once('close', () => {
            messages.textContent += `=== DataConnection has been closed ===\n`;
            sendTrigger.removeEventListener('click', onClickSend);
          });
      
          // Register closing handler
          closeTrigger.addEventListener('click', () => dataConnection.close(), {
            once: true,
          });
      
          function onClickSend() {
            const data = localText.value;
            dataConnection.send(data);
      
            messages.textContent += `You: ${data}\n`;
            localText.value = '';
          }
        
        setEventListener(mediaConnection);
    };
    
    // イベントリスナを設置する関数
    const setEventListener = mediaConnection => {
        mediaConnection.on('stream', stream => {
        // video要素にカメラ映像をセットして再生
        const videoElm = document.getElementById('their-video')
        videoElm.srcObject = stream;
        videoElm.play();
        });
    }

    //着信処理
    peer.on('call', mediaConnection => {
        mediaConnection.answer(localStream);
        setEventListener(mediaConnection);
    });


    peer.on('connection', dataConnection => {
        dataConnection.once('open', async () => {
          messages.textContent += `=== DataConnection has been opened ===\n`;
    
          sendTrigger.addEventListener('click', onClickSend);
        });
    
        dataConnection.on('data', data => {
          messages.textContent += `Remote: ${data}\n`;
        });
    
        dataConnection.once('close', () => {
          messages.textContent += `=== DataConnection has been closed ===\n`;
          sendTrigger.removeEventListener('click', onClickSend);
        });
    
        // Register closing handler
        closeTrigger.addEventListener('click', () => dataConnection.close(), {
          once: true,
        });
    
        function onClickSend() {
          const data = localText.value;
          dataConnection.send(data);
    
          messages.textContent += `You: ${data}\n`;
          localText.value = '';
        }
      });
})();