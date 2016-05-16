/**
 * Created by niteshkumar on 02/04/16.
 */
var http = require('http');
var fs= require('fs');
var path=require('path');
var mime = require('mime');
var cache = {};
function send404(response)
{
    response.writeHead(404,{"Content-Type":"text/plain"});
    response.write("Error 404 : requested page not Found");
    response.end();
}
function sendFile(response,filepath,fileContent)
{
    response.writeHead(200,{"Content-Type":mime.lookup(path.basename(filepath))});
    response.end(fileContent);
}
function serveStatic(response,cache,absPath)
{
    if(cache[absPath])
    {
        sendFile(response,absPath,cache[absPath]);
    }
    else
    {
        fs.exists(absPath,function(exists){
        if(exists)
        {
            fs.readFile(absPath,function(err,data){
               if(err)
               {
                   send404(response);
               }
               else
               {
                   cache[absPath]=data;
                   sendFile(response,absPath,data);
               }
            });
        }
        else
        {
        send404(response);
        }
        });
    }
}
var server=http.createServer(function(req,res){
        var filePath=false;
        if(req.url=="/")
        {
        filePath = 'public/index.html';
        }
        else
        {
            filePath = 'public'+req.url;
        }
        var absPath= './'+filePath;
        serveStatic(res,cache,absPath);
});
server.listen(4500);
console.log("Server is running on 4500");
var clientServer=require('./lib/chat_server');
clientServer.listen(server);
