require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const findOrCreate = require("mongoose-find-or-create");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const _ = require("lodash");
const FacebookStrategy = require("passport-facebook");
const { use } = require("passport");
var Promise = require('promise');
// const bcrypt= require("bcrypt");
// const saltRounds=10;
const app = express();
var userName;
var profilePic = "img/profile.png";
var navCartIcon = "img/cart.jpg";
const carouselTitle = [
  ["Best", "Quality", "Pets", "carousel-1.jpg"],
  ["World’s", "Best", "Dogs and Cats", "carousel-2.jpg"],
  ["Fastest", "Order", "Delivery", "carousel-3.jpg"],
];

const teamMembers = [
  "Nikhil Sahu",
  "Ratnesh Kumar",
  "Rishu Dubey",
  "Sanjeev Pandey",
];
const teamMembersPic = ["team-1.jpg", "team-2.jpg", "team-3.jpg", "team-4.jpg"];
const memberWork = [
  "Database Manager",
  "Data Collector",
  "Backend-Developer",
  "Frontend-Developer",
];

var userId = "null";

var noOfItem = 0;
var typeOfProduct = [];
var cartProductName = [];
var cartProductPrice = [];
var cartProductPic = [];
var cartProductId = [];

var items = [];
var dogsName = [];
var catsName = [];
var rabbitsName = [];
var birdsName = [];

var dogsId = [];
var catsId = [];
var rabbitsId = [];
var birdsId = [];

var dogsImage = [];
var catsImage = [];
var rabbitsImage = [];
var birdsImage = [];

var dogsPrice = [];
var catsPrice = [];
var rabbitsPrice = [];
var birdsPrice = [];

var selectedProductImage = [];
var selectedProductName = [];
var selectedProductPrice = [];
var productImage = [];
var productName = [];
var productPrice = [];
var productId = [];

var dogs;
var cats;
var birds;
var rabbits;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// passport sessionStorage
app.use(
  session({
    secret: "Oriental College Of Technology",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/petkartDB", {
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    require: true,
    index: true,
    unique: true,
    sparse: true,
  },
  password: String,
  mobileNo: String,
  dob: Date,
  lastLoginTime: Date,
  googleId: String,
  profilePicture: String,
  userCartItems: Array,
});
const cartSchema = new mongoose.Schema({
  productTitle: String,
  productName: String,
  productpics: Array,
  productPrice: Number,
});

// Plugins

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const cartitems = new mongoose.model("cartitems", cartSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/petkart",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      // console.log(profile);

      User.findOrCreate(
        {
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.picture,
        },
        function (err, user) {
          profilePic = profile.photos[0].value;
          userName = profile.name.givenName;
          // console.log(user);
          userId = user._id;
          // console.log(userId);
          return cb(err, user);
        }
      );
    }
  )
);
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_PASSWORD,
      callbackURL: "http://localhost:3000/auth/facebook/petkart",
      profileFields: ["id", "displayName", "photos", "email"],
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate(
        {
          username: profile.displayName,
          facebookId: profile.id,
        },
        function (err, user) {
          profilePic = profile.photos[0].value;
          userName = profile.name.givenName;
          return cb(err, user);
        }
      );
    }
  )
);

if (items.length === 0) {
  cartitems.find({ productTitle: "Dogs" }, function (err, result) {
    items.push(result);
    dogs = items[0];
    dogs.forEach(function (items) {
      dogsName.push(items.productName);
      dogsImage.push(items.productpics);
      dogsPrice.push(items.productPrice);
      dogsId.push(items._id);
    });
  });
  cartitems.find({ productTitle: "Cats" }, function (err, result) {
    items.push(result);
    cats = items[1];
    cats.forEach(function (items) {
      catsName.push(items.productName);
      catsImage.push(items.productpics);
      catsPrice.push(items.productPrice);
      catsId.push(items._id);
    });
  });
  cartitems.find({ productTitle: "Rabbits" }, function (err, result) {
    items.push(result);
    rabbits = items[2];
    rabbits.forEach(function (items) {
      rabbitsName.push(items.productName);
      rabbitsImage.push(items.productpics);
      rabbitsPrice.push(items.productPrice);
      rabbitsId.push(items._id);
    });
  });
  cartitems.find({ productTitle: "Birds" }, function (err, result) {
    items.push(result);
    birds = items[3];
    birds.forEach(function (items) {
      birdsName.push(items.productName);
      birdsImage.push(items.productpics);
      birdsPrice.push(items.productPrice);
      birdsId.push(items._id);
    });
  });
  productName = [dogsName, catsName, rabbitsName, birdsName];

  productImage = [dogsImage, catsImage, rabbitsImage, birdsImage];
  productPrice = [dogsPrice, catsPrice, rabbitsPrice, birdsPrice];
  productId = [dogsId, catsId, rabbitsId, birdsId];
}

app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/main-page");
  } else {
    res.render("home", {
      carouselTitle: carouselTitle,
      productTitle: ["Dogs", "Cats", "Rabbits", "Birds"],
      productImage: productImage,
      productName: productName,
      productPrice: productPrice,
      productId: productId,
      userDetail: userId,
      memberName: teamMembers,
      memberPic: teamMembersPic,
      memberWork: memberWork,
    });
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/petkart",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/main-page");
  }
);

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/petkart",
  passport.authenticate("facebook", {
    scope: ["public_profile"],
    failureRedirect: "/login",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/main-page");
  }
);

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/main-page", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("main-page", {
      userName: userName,
      profilePic: profilePic,
      // navCartIcon: navCartIcon,
      productId: productId,
      productTitle: ["Dogs", "Cats", "Rabbits", "Birds"],
      productImage: productImage,
      productName: productName,
      productPrice: productPrice,
      userDetail: userId,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/item", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("item", {
      userName: userName,
      profilePic: profilePic,
      navCartIcon: navCartIcon,
    });
  } else {
    res.redirect("/login");
  }
});
var l = 1;

app.get("/cart", function (req, res) {
  function userCartDetails() {
    return new Promise(function (resolve, reject) {
      User.find({ _id: req.user.id }, function (err, foundUser) {
        if (err) {
          reject(err);
        } else {
          //app,b,c,c,d,e;
          noOfItem = foundUser[0].userCartItems.length;
          foundUser[0].userCartItems.forEach(function (item) {
            cartitems.find({ _id: item }, function (err, foundItem) {
              cartProductId.push(foundItem[0]._id);
              typeOfProduct.push(foundItem[0].productTitle);
              cartProductName.push(foundItem[0].productName);
              cartProductPrice.push(foundItem[0].productPrice);
              cartProductPic.push(foundItem[0].productpics[0]);
              console.log("Pehle yaha aaya");
          
            });
          });
          var a=[cartProductId,typeOfProduct,cartProductName,cartProductPrice,cartProductPic];
          resolve(a);
        }
      });
    });
  }
  userCartDetails().then((a) => {
    if (req.isAuthenticated()) {
      console.log("Phr yaha aaya");
      res.render("addCartItem", {
        userName,
        profilePic,
        noOfItem,
        productType: a[1],
        productName: a[2],
        productPrice: a[3],
        cartProductImage: a[4],
        productId: a[0],
      });
    }
  }).catch((err)=>{
    console.log(err);
  });
});

app.get("/removeItem/:productTagId", function (req, res) {
  User.find({ _id: req.user.id }, function (err, foundUser) {
    for (var i = 0; i < foundUser[0].userCartItems.length; i++) {
      const newLocal = req.params.productTagId;
      if (foundUser[0].userCartItems[i] === newLocal) {
        foundUser[0].userCartItems.splice(i, 1);
        i--;
      }
    }
    console.log(foundUser[0]);
    foundUser[0].save(function (err) {
      if (err) {
        console.log(err);
      } else {
        var announymous = [];
        typeOfProduct = announymous;
        res.redirect("/cart");
      }
    });
  });
});
app.get("/:selectedProduct", function (req, res) {
  selectedProduct = req.params.selectedProduct;
  if (selectedProduct === "logout") {
    req.logout();
    res.redirect("/");
  } else {
    if (selectedProduct === "Dogs") {
      selectedProductImage = dogsImage;
      selectedProductName = dogsName;
      selectedProductPrice = dogsPrice;
    } else if (selectedProduct === "Cats") {
      selectedProductImage = catsImage;
      selectedProductPrice = catsPrice;
      selectedProductName = catsName;
    } else if (selectedProduct === "Rabbits") {
      selectedProductImage = rabbitsImage;
      selectedProductName = rabbitsName;
      selectedProductPrice = rabbitsPrice;
    } else if (selectedProduct === "Birds") {
      selectedProductImage = birdsImage;
      selectedProductName = birdsName;
      selectedProductPrice = birdsPrice;
    }
    if (req.isAuthenticated()) {
      res.render("products", {
        navType: "navbar",
        userName: userName,
        profilePic: profilePic,
        navCartIcon: navCartIcon,
        productTitle: selectedProduct,
        productImage: selectedProductImage,
        productPrice: selectedProductPrice,
        productName: selectedProductName,
      });
    } else {
      res.render("product", {
        navType: "header",
        productTitle: selectedProduct,
        productImage: selectedProductImage,
        productPrice: selectedProductPrice,
        productName: selectedProductName,
      });
    }
  }
});

app.get("/logout", function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/");
  });
  req.logout();
  res.redirect("/");
});

app.post("/signin", function (req, res) {
  User.register(
    {
      username: req.body.username,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      dob: req.body.dob,
      lastLoginTime: req.body.logTime,
    },
    req.body.password,
    function (err, result) {
      if (err) {
        console.log(err);
        res.redirect("/signup");
      } else {
        userId = result._id;
        passport.authenticate("local")(req, res, function () {
          res.redirect("/main-page");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function () {
        console.log(user);
        res.redirect("/main-page");
      });
    }
  });
});

app.post("/addToCart", function (req, res) {
  addCartItems = req.body.product_id;

  if (req.isAuthenticated()) {
    User.findById(req.user.id, function (err, foundUser) {
      console.log(foundUser);
      foundUser.userCartItems.push(addCartItems);
      foundUser.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/main-page");
        }
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.listen(3000, function () {
  console.log("Port started at 3000");
});
