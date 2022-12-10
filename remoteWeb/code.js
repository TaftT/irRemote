

var BleApp = new Vue({
    el: '#bleApp',
    data: {
        test:'Hello test',
        page:"",
        error:"",
        buttonName:"",
        customName:"",
        buttonCode:"",
        addingButton:false,
        myCharacteristic:null,
        // myCharacteristic:null,
        dec: new TextDecoder(),
        enc: new TextEncoder(),
        serviceId:"4fafc201-1fb5-459e-8fcc-c5c9c331914b",
        characteristicId:"beb5483e-36e1-4688-b7f5-ea07361b26a8",
        messageList:[],
        light:false,
        holdStart:0,
        buttonIndex:-1,
        iconOpitions:[
          "power",
          "mute",
          "volDown",
          "volUp",
          "arrowUp",
          "arrowDown",
          "arrowLeft",
          "arrowRight",
          "home",
          "back",
          "skipBack",
          "skipForward",
          "fastForward",
          "rewind",
          "star",
          "ok",
          "pause",
          "play",
          "pausePlay",
          "custom:",
        ],
        buttons:[
          {name:"power",buttonCode:"0xF708FB04"},
          {name:"arrowUp",buttonCode:"0xA857FB04"},
          {name:"home",buttonCode:"0xBC43FB04"},
          {name:"arrowLeft",buttonCode:"0xA758FB04"},
          {name:"ok",buttonCode:"0xA55AFB04"},
          {name:"arrowRight",buttonCode:"0xA659FB04"},
          {name:"volDown",buttonCode:"0xFC03FB04"},
          {name:"arrowDown",buttonCode:"0xA857FB04"},
          {name:"volUp",buttonCode:"0xFD02FB04"},
          {name:"back",buttonCode:""},
          {name:"skipBack",buttonCode:""},
          {name:"mute",buttonCode:""},
          {name:"rewind",buttonCode:""},
          {name:"pausePlay",buttonCode:""},
          {name:"fastForward",buttonCode:"adfsaffsd"},
          
          
          
        ]

    },
    methods: {
        sendMessage: function (message) {
          console.log("sending: ", this.buttonName)
          if (!this.myCharacteristic) {
            return;
          }
          try {
            this.myCharacteristic.writeValue(this.enc.encode(message));
          } catch (error) {
            this.myCharacteristic = null;
          }
          

        },
        receive: function () {
          console.log("receive")
          return new Promise((resolve, reject) => {
            if (!this.myCharacteristic) {
              reject();
            }
          
            this.myCharacteristic.readValue().then((v)=> {
              resolve(this.dec.decode(v))
            });
            
          })
          

        },
        connect: function () {
          console.log("connecting")
          navigator.bluetooth.requestDevice({
            filters: [{ services: [this.serviceId] }]
          }).then(device => {
            return device.gatt.connect();
          }).then(server => {
            return server.getPrimaryService(this.serviceId);
          }).then(service => {
            return service.getCharacteristic(this.characteristicId);
          }).then(characteristic => {
            this.myCharacteristic = characteristic;
          });
        },
        toggleled:function () {
          if (!this.myCharacteristic) {
            return;
          }
          this.light= !this.light
          let status = ""
          if(this.light){
            status='ledon'
          } else {
            status='ledoff'
          }
          console.log(this.myCharacteristic.getDevices())

          this.myCharacteristic.writeValue(this.enc.encode(status));
        
        },
        toggleledYellow:function () {
          if (!this.myCharacteristic) {
            return;
          }
          this.light= !this.light
          let status = ""
          if(this.light){
            status='Yledon'
          } else {
            status='Yledoff'
          }

          this.myCharacteristic.writeValue(this.enc.encode(status));
          
   
          
        },
        remotebuttonUp:function (buttonIndex) {
          if(this.buttonIndex == buttonIndex){
            let timePassed = Date.now()-this.holdStart;
            console.log("UP",timePassed)
            if(timePassed>1600){
              this.addingButton=false;
              this.sendMessage("scanning")
              this.page="editing";
              if(this.buttons[buttonIndex].name.includes('custom:')){
                this.buttonName= 'custom:'
                this.customName=this.buttons[buttonIndex].name.replace('custom:','')
              } else{
                this.buttonName=this.buttons[buttonIndex].name
              }
              
              
              this.buttonCode=this.buttons[buttonIndex].buttonCode
            } else {
              this.sendMessage(this.buttons[buttonIndex].buttonCode)
            }
          }
        },
        remotebuttondown:function (buttonIndex) {
          console.log("Down")
          this.holdStart = Date.now()
          this.buttonIndex = buttonIndex;
        },
        cancelNew:function () {
          
          this.buttonIndex = -1;
          this.page=''
        },
        addButton:function () {
          this.buttonIndex = -1;
          this.page='editing';
          this.addingButton=true;
          this.buttonName=""
          this.customName=""
          this.buttonCode=""
          this.sendMessage("scanning")
        },
        getCode:function () {
         
            this.receive().then((code)=>{
              if(code[0]==0 && code[1]=="x"){
                this.buttonCode = code
                this.error = ""
                console.log("buttonCode", this.buttonCode)
              } else {
                this.error = "Point your remote at the device and press a button. Then click 'Get Code'"
              }
              
            })

          
          
        },
        addButtonToList:function () {
          if(this.buttonCode!=""){
              this.buttons.push({name:this.buttonName+this.customName,buttonCode:this.buttonCode})
              this.page=""
              this.buttonName=""
              this.customName=""
              this.buttonCode=""
  
          }
          
          
        },
        updateButton:function () {
          if(this.buttonCode!=""){
              this.buttons[this.buttonIndex]={name:this.buttonName+this.customName,buttonCode:this.buttonCode}
              this.page=""
              this.buttonName=""
              this.customName=""
              this.buttonCode=""
  
          }
        },
        // send button code when pressed - send code with IR and blink led
        // get all buttons saved - read from text file and send line by line. send done
        // send new button - Read all from text file push new line, (save) write to text file. send done
        // edit button by index - read all from text file edit line at index and save. send done
        //-if no code provided wait for new code (ir reciever) then save
    },
    filters: {
        format: function (date) {
        //return moment(date).format('L');
        }
    },
    created: function () {
    }
})