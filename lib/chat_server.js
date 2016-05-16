/**
 * Created by niteshkumar on 06/04/16.
 */
var socketIo=require('socket.io');
var Io;
var guestNumber=1;
var nickName={};
var namesUsed=[];
var currentRoom={};
exports.listen = function(server)
{
    Io=socketIo.listen(server);
    Io.set('Log Level',1);
    Io.sockets.on('connection',function(socket){
        guestNumber=assignGuestName(socket,guestNumber,nickName,namesUsed);
        joinRoom(socket,'lobby');
        handleMessageBroadCasting(socket);
        handleNameChangeAttempts(socket,nickName,namesUsed);
        handleRoomJoining(socket);
        socket.on('rooms',function(){
        socket.emit('rooms',Io.sockets.manager.rooms);
        });
        handleClientDisconnect(socket);
    });

};
function assignGuestName(socket,guestNumber,nickName,nameUsed)
{
    var name ='Guest'+guestNumber;
    nickName[socket.id]=name;
    socket.emit('nameResult',{success:true,name:name});
    nameUsed.push(name);
    return guestNumber + 1;
}
function joinRoom(socket,room)
{
    socket.join(room);
    currentRoom[socket.id]=room;
    socket.emit('joinResult',{room:room});
    socket.broadcast.to(room).emit('message',{text:nickName[socket.id]+' had Joined '+room+' :'});
    var usersInRoom = Io.sockets.clients(room);
    if(usersInRoom.length > 1)
    {
        var usersInRoomSummary = 'Users currently in Room '+room+' : ';
        for(var index in usersInRoom)
        {
            var userSocketId = usersInRoom[index].id;
            if(userSocketId !=socket.id)
            {
                if(index > 0)
                {
                    usersInRoomSummary += ' , ';
                }
                usersInRoomSummary +=nickName[userSocketId]
            }
        }
        usersInRoomSummary +='.';
        socket.emit('message',{text:usersInRoomSummary});
    }
}
function handleNameChangeAttempts(socket,nickName,nameUsed)
{
    socket.on('nameAttempt',function(name){
    if(name.indexOf('Guest')==0)
    {
        socket.emit('nameResult',{success:false,message:"Name Cannot Begin With Guest"});
    }
    else
    {
        if(nameUsed.indexOf(name)==-1) {
            var oldName = nickName[socket.id];
            var oldNameIndex = nameUsed.indexOf(oldName);
            nameUsed.push(name);
            nickName[socket.id] = name;
            delete namesUsed[oldNameIndex];
            socket.emit('nameResult', {success: true, name: name});
            socket.broadcast.to(currentRoom[socket.id]).emit('message', {text: oldName + " was old Name now changed to " + name + ' . '});
        }
        else
        {
            socket.emit('nameResult',{success:false,message:"Name already in use"});
        }
    }
    });
}
function handleMessageBroadCasting(socket)
{
    socket.on('message',function(message){
    socket.broadcast.to(message.room).emit('message',{text:nickName[socket.id]+" : "+message.text});
    });
}
function handleRoomJoining(socket)
{
    socket.on('join',function(room){
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket,room.newRoom);
    })
}
function handleClientDisconnect(socket)
{
    socket.on('disconnect',function(){
       var nameIndex = namesUsed.indexOf(nickName[socket.id]);
       delete namesUsed[nameIndex];
       delete nickName[socket.id];
    });
}