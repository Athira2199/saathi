var express=require('express');
var mysql=require('mysql');
var app=express();
app.set('view engine','ejs');
app.use(express.urlencoded())
var session = require('express-session');
var flash = require('connect-flash');
app.use(flash()); // flash messages

app.use(session({ cookie: { maxAge: 60000 }, 
    secret: 'woot',
    resave: false, 
    saveUninitialized: false}));

    app.use(function (req, res, next) {
    res.locals.success = req.flash('success');
    res.locals.info = req.flash('info');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
  });

function connection(){
    con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"saathi"
    });
    con.connect(function(err){
        if(err) throw err;
        console.log("connected");
    })
}
function response(s){
    return new Promise(function(resolve,reject){
        con.query(s,function(err,result,fields){
            if(err){return reject(err);}
            resolve(result);
        })
    })
}
connection();
app.get('/',(req,res)=>{
    res.render('home')
})
app.post('/user/login',(req,res)=>{
    var username=req.body.username
    var password=req.body.password
    var s="SELECT * FROM users WHERE email = "+"'"+username+"'";
        response(s)
            .then((result)=>{
                if(result.length>0){
                if(result[0].password==password)
                console.log("valid");
                console.log(result);
                req.flash('success', "logged in successfully");
                res.redirect("/user/"+result[0].id)
                }
                else{
                    req.flash('error', "invalid user name password");
                    res.redirect("/")
                }
            })
            .catch((err)=>{
               
                console.log("error");
                throw err;
            })    
})
app.post('/user/signup',(req,res)=>{
    var x=req.body;
    var s="INSERT INTO users (fname,lname,mobile,email,password) VALUES("+"'"+x['fname']+"',"+"'"+x['lname']+"',"+"'"+x['mobile']+"',"+"'"+x['email']+"',"+"'"+x['password']+"')";
        response(s)
            .then(()=>
            {
                req.flash('success', "sign up successful");
                res.redirect('/');
            })
            .catch((err)=>{
                req.flash('error', "sign up unsuccessful");
                res.redirect('/');
                console.log("error");
                throw err;
            })
})
app.get('/user/:id',(req,res)=>{
    res.render('dashboard',{
        id:req.params.id
    })
})

app.get('/user/:id/expense',(req,res)=>{
    var s="SELECT * FROM  categories";
    response(s)
        .then((result)=>{
            res.render("expense",{
                results:result
            })
        })
        .catch((err)=>{
            console.log("error");
            throw err;
        })         
})
app.get('/user/:id/expense/add',(req,res)=>{
    var s="INSERT INTO expense (user_id,category_id,amount,date) VALUES("+"'"+req.params.id+"',"+"'"+req.query.category+"',"+"'"+req.query.amount+"',"+"'"+req.query.date+"')";
    response(s)
        .then((result)=>{
            req.flash('success', "successfully added");
            res.redirect("/user/"+req.params.id+"/expense")
        })
        .catch((err)=>{
            console.log("error");
            throw err;
        })      
})
app.get('/user/:id/expense/overview',(req,res)=>{
    var s="SELECT SUM(amount) as total FROM expense WHERE category_id="+"'"+req.query.category+"'";
    response(s)
    .then((result)=>{
       return result[0].total;
    })
    
    .catch((err)=>{
    
        console.log("error");
        throw err;
    })   
})
app.get('/user/:id/todo',(req,res)=>{
    var sort="STATUS";
    if(req.query.sort){
        sort=req.query.sort
    }
    var s="SELECT * FROM  todo WHERE user_id = "+"'"+req.params.id+"'"+"ORDER BY "+sort;
    response(s)
        .then((result)=>{
            res.render("todo",{
                results:result
            })
        })
        .catch((err)=>{
        
            console.log("error");
            throw err;
        })      
})

app.get('/user/:id/todo/add',(req,res)=>{
    var s="INSERT INTO todo (user_id,status,aim,start_date,end_date) VALUES("+"'"+req.params.id+"',"+"'"+req.query.status+"',"+"'"+req.query.aim+"',"+"'"+req.query.start_date+"',"+"'"+req.query.end_date+"')";
    response(s)
        .then((result)=>{
            res.redirect("/user/"+req.params.id+"/todo")
        })
        .catch((err)=>{
            console.log("error");
            throw err;
        })      
})

app.get('/user/:id/todo/:nid/delete',(req,res)=>{
    var s= 'DELETE FROM todo WHERE id ='+"'"+req.params.nid+"'"+"AND user_id = "+"'"+req.params.id+"'";
    response(s)
        .then((result)=>{
            req.flash('error', "successfully deleted");
            res.redirect('/user/'+req.params.id+'/todo')
        })
        .catch((err)=>{
            req.flash('error', "oops something happened");
            console.log(err);
            throw err;
        })
})


app.get('/user/:id/directory',(req,res)=>{
    var s="SELECT * FROM  DIRECTORY WHERE user_id = "+"'"+req.params.id+"'"+"ORDER BY name";
    response(s)
        .then((result)=>{
            res.render("directory",{
                results:result
            })
        })
        .catch((err)=>{
        
            console.log("error");
            throw err;
        })    
})
app.post('/user/:id/directory/add',(req,res)=>{
    var s="INSERT INTO directory (user_id,name,email,phone) VALUES("+"'"+req.params.id+"',"+"'"+req.body.name+"',"+"'"+req.body.email+"',"+"'"+req.body.mobile+"')";
    response(s)
        .then((result)=>{
            req.flash('success', "successfully added");
            res.redirect('/user/'+req.params.id+'/directory')
        })
        .catch((err)=>{
        
            console.log("error");
            throw err;
        })    
})
app.get('/user/:id/notes',(req,res)=>{
    var s="SELECT * FROM  notes WHERE user_id = "+"'"+req.params.id+"'"+"ORDER BY rating DESC";
    response(s)
        .then((result)=>{
            res.render("notes",{
                results:result
            })
               
        })
        .catch((err)=>{
           
            console.log("error");
            throw err;
        })    
})

app.post('/user/:id/notes/add',(req,res)=>{
    var s="INSERT INTO notes (user_id,content,rating) VALUES("+"'"+req.params.id+"',"+"'"+req.body.content+"',"+"'"+req.body.rating+"')";
    response(s)
        .then((result)=>{
            req.flash('success', "successfully added");
            res.redirect('/user/'+req.params.id+'/notes')
        })
        .catch((err)=>{
            req.flash('error', "oops something happened");
            console.log("error");
            throw err;
        })    
})

app.get('/user/:id/notes/:nid/delete',(req,res)=>{
    var s= 'DELETE FROM notes WHERE id ='+"'"+req.params.nid+"'"+"AND user_id = "+"'"+req.params.id+"'";
    response(s)
        .then((result)=>{
            req.flash('error', "successfully deleted");
            res.redirect('/user/'+req.params.id+'/notes')
        })
        .catch((err)=>{
            req.flash('error', "oops something happened");
            console.log(err);
            throw err;
        })
})

app.get('/user/:id/journal',(req,res)=>{
    res.render("journal",{
        content:"",
        date:""
    })
})

app.get('/user/:id/view',(req,res)=>{
    var date=req.query.date
    var id=req.params.id;
    var s="SELECT * FROM journal WHERE date = "+"'"+date+"'"+"AND user_id = "+"'"+id+"'";
    response(s)
        .then((result)=>{
            if(result.length<0){
                date=""
                content=""
            }
               res.render('journal',{
                   content:result[0].content,
                   date:date
               })
        })
        .catch((err)=>{
           
            console.log("error");
            throw err;
        })    
})
app.get('/user/:id/write',(req,res)=>{
    var date=req.query.date;
    var content=req.query.content;
    var id=req.params.id;
    var s="SELECT * FROM journal WHERE date = "+"'"+date+"'"+"AND user_id = "+"'"+id+"'";
    response(s)
        .then((result)=>{
               if(result.length>0)
               {
                   var s="UPDATE journal SET content ="+"'"+content+"'"+"WHERE date = "+"'"+date+"'"+"AND user_id = "+"'"+id+"'";
                   response(s)
                    .then((result)=>{
                        console.log("done")
                        res.render("journal",{
                            date:"",
                            content:""
                        })
                    })
                    .catch((err)=>{
                        console.log("error");
                        throw err;
                    })    
               }
               else{
                   console.log("insert")
                   var s="INSERT INTO journal (user_id,date,content) VALUES("+"'"+id+"',"+"'"+date+"',"+"'"+content+"')";
                   response(s)
                    .then((result)=>{
                        console.log("done")
                        res.render("journal",{
                            date:"",
                            content:""
                        })
                    })
                    .catch((err)=>{
                        console.log("error");
                        throw err;
                    })    
               }
        })
        .catch((err)=>{
           
            console.log("error");
            throw err;
        })    
})
app.listen(3000)
