/** memoHandler.js **/   

var querystring = require('querystring'); 
var url = require('url');
var mongodb = require('mongodb');

var server = new mongodb.Server('localhost', 27017, {});
var db = new mongodb.Db('mydatabase', server, {w: 1});

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
 
function _insertMemo(body, callback) { 
    body = typeof body === 'string' ? JSON.parse(body) : body;  

    console.log(body.author);
    console.log(body.memo);

    var memo = { 
        author: body.author,
         memo: body.memo,
         date: new Date() 
    };  
    
    db.open(function(err) {
     if (err) throw err;
        db.collection('memo').insert(memo , function(err, inserted){
            if (err) throw err;
            console.dir("successfully inserted: " + JSON.stringify(inserted));
            db.close();
            callback();
        });
    });
}  
 
function _findMemo(where, callback) { 
    where = where || {} 

    db.open(function(err) {
        if (err) throw err;
        console.log("where " + where.toString());
        db.collection('memo').find(where).toArray(function (err,docs){
            console.dir(docs);
            db.close();
            callback(null, docs);
        });
    });
}  
 
function _updateMemo(where, body, callback) { 
    body = typeof body === 'string' ? JSON.parse(body) : body;

    db.open(function(err) {
        if (err) throw err;
        //multi:true에서 오류를 이유로 false로 임시 처리함. 왜?
        db.collection('memo').update(where, { $set: body }, {multi: false}, function(err, updated) {
            if (err) throw err;
            console.dir("Successfully updated " + updated + " document!");
            db.close();    
            callback();
        });
    });
}  
 
function _removeMemo(where, callback) { 
    db.open(function(err) {
        if (err) throw err; 
        db.collection('memo').remove(where, { multi: true}, function(err, removed) {
            if(err) throw err;
            console.dir("Successfully deleted " + removed + " documents!");
            db.close();
            callback();
        }); 
    });
}
