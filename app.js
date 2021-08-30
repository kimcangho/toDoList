// Require modules
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
// require mongoose
const mongoose = require("mongoose");
//require lodash for handling case sensitivity of custom listSchema
// const _ = require("lodash");
//Convention: assign express() as app constant
const app = express();


//Add ejs through view engine
app.set('view engine', 'ejs');

//Use body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));
//Use public folder contents as a static resource
app.use(express.static("public"));

//Connect to MongoDB server with user account credentials
mongoose.connect("mongodb+srv://<username>:<password>@cluster0.tqdby.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Create new items schema
const itemsSchema = {
  name: String
};

// Create new items model
const Item = mongoose.model("Item", itemsSchema);

//Create new documents
const item1 = new Item({
  name: "Do the dishes"
});

const item2 = new Item({
  name: "Make the food"
});

const item3 = new Item({
  name: "Dance like no one is watching"
});

// Put documents into Array
const defaultItems = [item1, item2, item3];

//Create new schema for storing custom lists
const listSchema = {
  name: String,
  items: [itemsSchema]
};

//Create new model based off of list listSchema
const List = mongoose.model("List", listSchema);

//Send string for home route get request from client browser
app.get("/", function(req, res) {

  //Find all items in items collection
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      // Insert array into Collection
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log("Couldn't insert default items array!");
        } else {
          console.log("Inserted to-do list item array!");
        }
      });
      //Redirect onto home route
      res.redirect("/");

    } else {
      //Can add multiple key-value pairs in object to pass as an argument through the render method
      res.render("list", {
        listTitle: day,
        newListItem: foundItems
      });
    }

  });

  //Factored out current date logic into date.js file
  let day = "Today!";

});

app.post("/", function(req, res) {


  const itemName = req.body.newItem;
  const listName = req.body.list;

  //Create new item document based on posted item name from form submission
  const item = new Item ({
    name: itemName
  });

  if (listName === "Today!") {
    item.save();
    //Redirect to home route to show new added line item
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res) {
    const checkedId = req.body.checked;
    const listName = req.body.listName;

    //If listName is for home route
    if (listName === "Today!") {
      Item.findByIdAndRemove(checkedId, function(err) {
        if (!err) {
          console.log("Deletion of " + checkedId);
          res.redirect("/");
        }
      });

    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedId}}}, function(err,foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
    }


});

app.get("/about", function(req, res) {
  res.render("about"); //No need to pass key-value pair object since there is no dynamically populated content.
});

//Post request for dynamic parameters - Used for custom lists
app.get("/:customList", function(req,res) {
  //Bind custom parameter to custom list name
  // const customListName = _.capitalize(req.params.customList);
  const customListName = req.params.customList;

  //Control logic to determine if custom list name already exists inside
  // database as a document
  List.findOne({name: customListName}, function(err,found) {
    if (!err) {
      if (!found) {
        //Create new list document
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);

      } else {
        res.render("list", {listTitle: found.name, newListItem: found.items});
      }
    } else {
      console.log("Error in findOne()");
    }
  });

});

//Listen in on heroku dynamic port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

// //Listen in on assigned part and log active message
app.listen(port, function() {
  console.log("Server running!")
});
