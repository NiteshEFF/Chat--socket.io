/**
 * Created by niteshkumar on 08/04/16.
 */
function divEscapedContentElement(message) {
    var div= document.createElement("div");
    var text= document.createTextNode(message);
    div.appendChild(text);
    return div;
}
function divSystemContentElement(message)
{
    var div = document.createElement("div");
    var i=document.createElement("i");
    var text=document.createTextNode(message);
    i.appendChild(text);
    div.appendChild(i);
    return div;
}
function processUserInput(chatApp,socket)
{
    var message = document.querySelector("#send-message").value;
    var systemMessage;
    if(message.charAt(0)==="/")
    {
        systemMessage = chatApp.processCommand(message);
        if(systemMessage)
        {
            document.querySelector("#messages").appendChild(divSystemContentElement(systemMessage));
        }
    }
    else
    {
        chatApp.sendMessage(document.querySelector("#room").innerHTML,message);
        document.querySelector("#messages").appendChild(divEscapedContentElement(message));
    }
    document.querySelector("#send-message").value="";
}
var socket = io.connect();
window.addEventListener("load",function(e){
    var chatApp= new Chat(socket);
    socket.on('nameResult',function(result){
    var message;
        if(result.success)
        {
            message="You are now Known as "+result.name;
        }
        else
        {
            message = result.message;
        }
        document.querySelector("#messages").appendChild(divSystemContentElement(message));
    });
    socket.on('joinResult',function(result){
    document.querySelector("#room").innerHTML=result.room;
        document.querySelector("#messages").appendChild(divSystemContentElement("Room Changed"));

    });
    socket.on('message',function(message){
     var element=document.createElement("div");
        var text=document.createTextNode(message.text);
        element.appendChild(text);
        document.querySelector("#messages").appendChild(element);
    });
    socket.on('rooms',function(rooms){
    document.querySelector("#room-list").innerHTML="";
        for(var room in rooms)
        {
            room = room.substring(1,room.length);
            if(room !="")
            {
                document.querySelector("#room-list").appendChild(divEscapedContentElement(room));
            }
        }
        document.querySelector("#room-list div").addEventListener("click",function(e){
            chatApp.processCommand('/join '+ e.target.innerHTML);
            document.querySelector("#send-message").focus();
        });
    });
    setInterval(function(){
    socket.emit('rooms');
    },1000);
    document.querySelector("#send-message").focus();
    document.querySelector("#send-form").addEventListener("submit",function(e){
        e.preventDefault();
        processUserInput(chatApp,socket);
    });
});