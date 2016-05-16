/**
 * Created by niteshkumar on 08/04/16.
 */
function Chat(socket)
{
    this.socket=socket;
}
Chat.prototype.sendMessage = function(room,text)
{
    var message={
        room : room,
        text : text
    };
    this.socket.emit('message',message);
};
Chat.prototype.changeRoom=function(room)
{
this.socket.emit('join',{
   newRoom : room
});
};
Chat.prototype.processCommand = function(command)
{
    var words=command.split(" ");
    var command = words[0].substring(1,words[0].length).toLowerCase();
    var message = false;
    switch (command)
    {
        case 'join':
            words.shift();
            var rooms = words.join(' ');
            this.changeRoom(rooms);
            break;
        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.socket.emit('nameAttempt',name);
            break;
        default :
            message = "unRecognised Command";
            break;
    }
    return message;
};