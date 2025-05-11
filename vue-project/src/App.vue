<script setup>
import "bootstrap/dist/css/bootstrap.min.css";
// import { ref, onMounted } from "vue";
import { io } from "socket.io-client";
import { ref, onMounted, nextTick } from "vue";

const socket = io("http://localhost:5174"); // 連線後端

//使用者目前輸入的訊息(綁定在輸入框中)
const newMessage = ref("");
//聊天訊息的陣列，會顯示在畫面上
const messages = ref([]);
// 對話區的 ref
const conversationRef = ref(null)

const selfId = ref(""); // 👈 記錄自己的 socket.id

// 建立 & 儲存持久的 userId（不會因為刷新消失）
const userId = ref(localStorage.getItem("userId") || generateUserId());

function generateUserId() {
  const id = Math.random().toString(36).substring(2, 10);
  localStorage.setItem("userId", id);
  return id;
}



//這兩個變數用 ref() 包起來，讓它們具有「響應性」，當內容改變時，Vue 會自動更新畫面。

//回傳現在的時間，格式為時:分的24小時制
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

//如果使用者沒有輸入任何內容(或只輸入空白)，就不送出
const sendMessage = () => {
  if (newMessage.value.trim() === "") return;

  //建立一個訊息物件，包含文字、發送者是自己"me"、時間
  const message = {
    text: newMessage.value,
    time: getCurrentTime(),
    userId: userId.value, // 👈 傳 userId 給後端
  };


  //傳給後端
  socket.emit("chat message", message);
  //傳送完之後，清空輸入框
  newMessage.value = "";
  scrollToBottom(); //傳完訊息後自動捲到底
};

//設定 Socket 監聽事件

onMounted(() => {
  console.log("🧩 我的 userId 是", userId.value)

//告訴後端你的 userId
  socket.emit("register", userId.value);


  socket.on("chat history", ({ history, selfId: id }) => {
    console.log("📜 接收到歷史訊息", history)

    selfId.value = id;
    messages.value = history.map((msg) => ({
      ...msg,
      sender: msg.userId === userId.value ? "me" : "other", //用後端提供的 id 判斷
    }));
    scrollToBottom(); // 一進來載入歷史訊息後也捲到底


  });

  socket.on("chat message", (msg) => {
    console.log("📩 收到即時訊息", msg)
    console.log("🧾 本地 userId", userId.value, "→ 訊息來自", msg.userId);
        // 這裡要先判斷 selfId 有沒有拿到再推進去
        // if (!selfId.value) return; if (!selfId.value) return;
        const sender = msg.userId === userId.value.toString() ? "me" : "other";
        console.log("✉️ 新訊息", msg, "→ 判斷為", sender)
        // console.log("✉️ 判斷為", sender);


    messages.value.push({ ...msg, sender });
    scrollToBottom(); //每收到新訊息就捲到底
  });
});

// 自動捲動

const scrollToBottom = () => {
  nextTick(() => {
    if (conversationRef.value) {
      conversationRef.value.scrollTop = conversationRef.value.scrollHeight;
    }
  });
};

</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-3 vh-100">
        <div
          class="d-flex flex-column align-items-stretch flex-shrink-0 bg-body-tertiary"
        >
          <a
            href="/"
            class="d-flex align-items-center flex-shrink-0 p-3 link-body-emphasis text-decoration-none border-bottom"
          >
            <svg
              class="bi pe-none me-2"
              width="30"
              height="24"
              aria-hidden="true"
            >
              <use xlink:href="#bootstrap"></use>
            </svg>
            <span class="fs-5 fw-semibold">聊天室</span>
          </a>

          <div class="list-group list-group-flush border-bottom scrollarea">
            <a
              href="#"
              class="list-group-item list-group-item-action active py-3 lh-sm"
              aria-current="true"
            >
              <div
                class="d-flex w-100 align-items-center justify-content-between"
              >
                <strong class="mb-1">007</strong>
                <small>Wed</small>
              </div>
              <div class="col-10 mb-1 small">message</div>
            </a>
          </div>
        </div>
      </div>

      <div class="col-9 border">
        <div id="head" class="py-3 lh-sm border-bottom">
          <strong class="mb-1">007</strong>
        </div>



<div id="conversation" ref="conversationRef">
  <div
    v-for="(msg, index) in messages"
    :key="index"
    class="d-flex mb-2"
    :class="msg.sender === 'me' ? 'justify-content-end' : 'justify-content-start'"
  >
    <div class="col-auto">
      <div
        class="alert d-inline-block"
        :class="msg.sender === 'me' ? 'alert-primary' : 'alert-secondary'"
        role="alert"
      >
        {{ msg.text }}
      </div>
      <div
        class="text-muted small"
        :class="msg.sender === 'me' ? 'text-end' : 'text-start'"
      >
        {{ msg.time }}
      </div>
    </div>
  </div>
</div>


          <!-- <div class="row pt-2">
            <div class="col-6"></div>
            <div class="col-6">
              <div class="alert alert-success d-inline-block float-end " id="speech-bubble" role="alert">
                hihi
              </div>
            </div>
            
          </div> -->
        <!-- </div> -->

        <form
          id="reply"
          class="p-3 w-100 input-area"
          @submit.prevent="sendMessage"
        >
          <div class="input-group">
            <input v-model="newMessage" placeholder="輸入訊息" />
            <button class="btn btn-primary" type="submit">送出</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
button {
  border: none;
  width: 80px;
}
#head {
  height: 50px;
}

#conversation {
  overflow: scroll;
  height: calc(100vh - 120px);
}

#reply {
  height: 70px;
}

.input-group input {
  width: calc(100% - 80px);
  border: 1px solid rgb(211, 211, 211);
  border-radius: 2px;
}
</style>
