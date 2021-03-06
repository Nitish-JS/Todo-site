

const express = require("express");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _=require("lodash");
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);
const classes=new Item({
  name:"Online classes"
});
const workout=new Item({
  name:"Workout"
});
const cp=new Item({
  name:"Competitive programming"
});

const defaultItems=[classes,workout,cp];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);


const day = date.getDate();
app.get("/", function (req, res) {
  Item.find({},function(err,results){
    if(results.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Data inserted successfully");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", { listTitle: day, newListItems: results });
    }
    if(err){
      console.log(err);
    }
  })
});

app.get("/:customList",function(req,res){
  const customListName=_.capitalize(req.params.customList);
  
  List.findOne({name:customListName},function(err,found){
    if(!err){
      if(!found){
        //creating new list
        const list=new List({
          name:customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        //showing existing list
        res.render("list",{listTitle:found.name,newListItems:found.items})
        
      }
    }
  })
  
})



app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });

  if(listName===day){
    item.save();
    res.redirect("/")
  }
  else{
    List.findOne({name:listName},function(err,found){
      found.items.push(item);
      found.save();
      res.redirect("/"+listName);
    })
  }
  
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkBox;
  const listName=req.body.listName;
  if(listName===day){
    Item.findByIdAndRemove(checkedItemId,function (err) {
      if(!err){
        console.log("deletion success");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items :{_id:checkedItemId}}},function(err,found){
      if(!err){
        console.log("deletion Success");
        res.redirect("/"+listName);
      }
    })
  }

  
})

let port=process.env.PORT;
if(port== null || port==""){
  port=3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});
