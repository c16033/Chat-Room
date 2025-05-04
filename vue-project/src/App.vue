<script setup>
import "bootstrap/dist/css/bootstrap.min.css";
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000') // 連線後端

const message = ref('')
const messages = ref([])

const sendMessage = () => {
  if (message.value.trim()) {
    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    socket.emit('chat-message', {
      text: message.value,
      time: time
    })
    message.value = ''
  }
}

onMounted(() => {
  socket.on('chat-message', (msg) => {
    messages.value.push(msg)
  })
})




</script>

<template>
  



  <div class="container">
    <div class="row">
      <div class="col-3 vh-100">
        <div class="d-flex flex-column align-items-stretch flex-shrink-0 bg-body-tertiary">
        <a href="/"class="d-flex align-items-center flex-shrink-0 p-3 link-body-emphasis text-decoration-none border-bottom">
        <svg class="bi pe-none me-2" width="30" height="24" aria-hidden="true">
          <use xlink:href="#bootstrap"></use>
        </svg>
        <span class="fs-5 fw-semibold" >聊天室</span>
      </a>
     
      <div class="list-group list-group-flush border-bottom scrollarea ">
        <a href="#"class="list-group-item list-group-item-action active py-3 lh-sm"aria-current="true">
          <div class="d-flex w-100 align-items-center justify-content-between">
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

        <div id="conversation">
          <div class="" role="alert"  v-for="(msg, index) in messages">
            <div class="col-6">
              <div class="alert alert-success d-inline-block" role="alert">
                {{msg.text}}
              </div>
              <span >{{ msg.time }}</span>

            </div>
            <div class="col-6"></div>
            
          </div>

          <!-- <div class="row pt-2">
            <div class="col-6"></div>
            <div class="col-6">
              <div class="alert alert-success d-inline-block float-end " id="speech-bubble" role="alert">
                hihi
              </div>
            </div>
            
          </div> -->


        </div>

        <form id="reply" class="p-3 w-100" @submit.prevent="submit">
          <div class="input-group">
            <input class="form-control " placeholder="輸入訊息" v-model="message" @keyup.enter="sendMessage"/>
            <button class="btn btn-primary" type="submit" @click="sendMessage">送出</button>

          </div>
          
        </form>

      </div>
    
    </div>
  </div>


</template>

<style scoped>
button{
  border: none;
  width: 80px
}
#head{
    height: 50px;
}

#conversation{
    overflow: scroll;
    height: calc(100vh - 120px);
}

#reply{
    height: 70px;
}



</style>
