/** memoHandler.js **/   

var querystring = require('querystring'); 
var url = require('url');
var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var server = "mongodb://localhost:27017/memo";
 
function _insertMemo(body, callback) { 
    body = typeof body === 'string' ? JSON.parse(body) : body;  

    body.author = body.author === undefined ? "park" : body.author;
    body.memo = body.memo === undefined ? "testMemo" : body.memo;

    console.log(body.author);
    console.log(body.memo);
    
    var memo = { 
        author: body.author,
        memo: body.memo,
          date: new Date() 
    };  

    MongoClient.connect(server, function(err, db) {
        if (err) throw err;

        db.collection('memo').save(memo, function(err, saved) {
            if (err) throw err;
            console.dir("Successfully saved " + saved + " document!");
            db.close();
            callback();
        })
    });
}  
 
function _findMemo(where, callback) { 
    where = where || {} 

    MongoClient.connect(server, function(err, db) {
        if (err) throw err;
        
        db.collection('memo').find(where).toArray(function (err, docs){
            console.dir(docs);
            db.close();
            callback(null, docs);
        });
    });
}

function _updateMemo(where, body, callback) { 
    body = typeof body === 'string' ? JSON.parse(body) : body;

    MongoClient.connect(server, function(err, db) {
        if (err) throw err;

        var operator = {
            $set : {
                memo : "update memo",
                date : new Date()
            }
        };
        
        db.collection('memo').update(where, operator, function(err, updated) {
            if (err) throw err;
            console.dir("Successfully updated " + updated + " document!");
            db.close();    
            callback();
        });
    });
}  
 
function _removeMemo(where, callback) { 
    where = typeof where === undefined ? {author : testAuthor} : where;

    MongoClient.connect(server, function(err, db) {
        if (err) throw err; 

        db.collection('memo').remove(where, function(err, removed) {
            if(err) throw err;
            console.dir("Successfully deleted " + removed + " documents!");
            db.close();
            callback();
        }); 
    });
}


exports.create = function(req, res, body) { 
    _insertMemo(body, function(error, result) { 
        res.writeHead(200, { "Content-Type": "application/json" }); 
        res.write('{"type": "creatememo"}'); 
        res.end(); 
    }); 
};  

exports.read = function(req, res) { 
    _findMemo({}, function(error, results) { 
        res.writeHead(200, {"Content-Type": "application/json"}); 
        res.write(JSON.stringify(results));  
        res.end(); 
    }); 
};  
 
exports.update = function(req, res, body) { 
    var query = url.parse(req.url).query; 
    var where = querystring.parse(query);  

    _updateMemo(where, body, function(error, results) { 
        res.writeHead(200, {"Content-Type": "application/json"}); 
        res.write('{"type": "updatememo"}'); 
        res.end(); 
    }); 
};  
 
exports.remove = function(req, res, body) { 
    var query = url.parse(req.url).query; 
    var where = querystring.parse(query);  
 
    console.log(where);
    console.log(body);

    _removeMemo(where, function(error, results) { 
        res.writeHead(200, {"Content-Type": "application/json"}); 
        res.write('{"type": "removememo"}'); 
        res.end(); 
    });  
};   
