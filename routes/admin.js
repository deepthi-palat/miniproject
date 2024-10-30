var express = require("express");
var adminHelper = require("../helper/adminHelper");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
var router = express.Router();
var db = require("../config/connection");
var collections = require("../config/collections");
const ObjectId = require("mongodb").ObjectID;

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInAdmin) {
    next();
  } else {
    res.redirect("/admin/signin");
  }
};

/* GET admins listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let administator = req.session.admin;
  adminHelper.getAllProducts().then((products) => {
    res.render("admin/home", { admin: true, products, layout: "admin-layout", administator });
  });
});


///////ALL provider/////////////////////                                         
router.get("/all-providers", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllproviders().then((providers) => {
    res.render("admin/provider/all-providers", { admin: true, layout: "admin-layout", providers, administator });
  });
});



router.post("/approve-provider/:id", verifySignedIn, async function (req, res) {
  await db.get().collection(collections.PROVIDER_COLLECTION).updateOne(
    { _id: ObjectId(req.params.id) },
    { $set: { approved: true } }
  );
  res.redirect("/admin/all-providers");
});

router.post("/reject-provider/:id", function (req, res) {
  const providerId = req.params.id;
  db.get()
    .collection(collections.PROVIDER_COLLECTION)
    .updateOne({ _id: ObjectId(providerId) }, { $set: { approved: false, rejected: true } })
    .then(() => {
      res.redirect("/admin/all-providers");
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/admin/all-providers");
    });
});


router.post("/delete-provider/:id", verifySignedIn, async function (req, res) {
  await db.get().collection(collections.PROVIDER_COLLECTION).deleteOne({ _id: ObjectId(req.params.id) });
  res.redirect("/admin/all-providers");
});

///////ADD provider/////////////////////                                         
router.get("/add-provider", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/provider/add-provider", { admin: true, layout: "admin-layout", administator });
});

///////ADD provider/////////////////////                                         
router.post("/add-provider", function (req, res) {
  adminHelper.addprovider(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/provider-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/admin/provider/all-providers");
      } else {
        console.log(err);
      }
    });
  });
});

///////EDIT provider/////////////////////                                         
router.get("/edit-provider/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let providerId = req.params.id;
  let provider = await adminHelper.getproviderDetails(providerId);
  console.log(provider);
  res.render("admin/provider/edit-provider", { admin: true, layout: "admin-layout", provider, administator });
});

///////EDIT provider/////////////////////                                         
router.post("/edit-provider/:id", verifySignedIn, function (req, res) {
  let providerId = req.params.id;
  adminHelper.updateprovider(providerId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/provider-images/" + providerId + ".png");
      }
    }
    res.redirect("/admin/provider/all-providers");
  });
});

///////DELETE provider/////////////////////                                         
// router.get("/delete-provider/:id", verifySignedIn, function (req, res) {
//   let providerId = req.params.id;
//   adminHelper.deleteprovider(providerId).then((response) => {
//     res.redirect("/admin/all-providers");
//   });
// });

///////DELETE ALL provider/////////////////////                                         
router.get("/delete-all-providers", verifySignedIn, function (req, res) {
  adminHelper.deleteAllproviders().then(() => {
    res.redirect("/admin/provider/all-providers");
  });
});

router.get("/all-products", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllProducts().then((products) => {
    res.render("admin/all-products", { admin: true, layout: "admin-layout", products, administator });
  });
});




router.get("/all-drivers", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAlldrivers().then((drivers) => {
    res.render("admin/driver/all-drivers", { admin: true, layout: "admin-layout", drivers, administator });
  });
});



router.post("/approve-driver/:id", verifySignedIn, async function (req, res) {
  await db.get().collection(collections.DRIVER_COLLECTION).updateOne(
    { _id: ObjectId(req.params.id) },
    { $set: { approved: true } }
  );
  res.redirect("/admin/all-drivers");
});

router.post("/reject-driver/:id", function (req, res) {
  const driverId = req.params.id;
  db.get()
    .collection(collections.DRIVER_COLLECTION)
    .updateOne({ _id: ObjectId(driverId) }, { $set: { approved: false, rejected: true } })
    .then(() => {
      res.redirect("/admin/all-drivers");
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/admin/all-drivers");
    });
});


router.post("/delete-driver/:id", verifySignedIn, async function (req, res) {
  await db.get().collection(collections.DRIVER_COLLECTION).deleteOne({ _id: ObjectId(req.params.id) });
  res.redirect("/admin/all-drivers");
});

router.get("/signup", function (req, res) {
  if (req.session.signedInAdmin) {
    res.redirect("/admin");
  } else {
    res.render("admin/signup", {
      admin: true, layout: "admin-empty",
      signUpErr: req.session.signUpErr,
    });
  }
});

router.post("/signup", function (req, res) {
  adminHelper.doSignup(req.body).then((response) => {
    console.log(response);
    if (response.status == false) {
      req.session.signUpErr = "Invalid Admin Code";
      res.redirect("/admin/signup");
    } else {
      req.session.signedInAdmin = true;
      req.session.admin = response;
      res.redirect("/admin");
    }
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedInAdmin) {
    res.redirect("/admin");
  } else {
    res.render("admin/signin", {
      admin: true, layout: "admin-empty",
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  adminHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedInAdmin = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/admin/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedInAdmin = false;
  req.session.admin = null;
  res.redirect("/admin");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/add-product", { admin: true, layout: "admin-layout", administator });
});

router.post("/add-product", function (req, res) {
  adminHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/admin/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let productId = req.params.id;
  let product = await adminHelper.getProductDetails(productId);
  console.log(product);
  res.render("admin/edit-product", { admin: true, layout: "admin-layout", product, administator });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  adminHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/admin/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  adminHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/admin/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  adminHelper.deleteAllProducts().then(() => {
    res.redirect("/admin/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllUsers().then((users) => {
    res.render("admin/users/all-users", { admin: true, layout: "admin-layout", administator, users });
  });
});

router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  adminHelper.removeUser(userId).then(() => {
    res.redirect("/admin/all-users");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  adminHelper.removeAllUsers().then(() => {
    res.redirect("/admin/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let { fromDate, toDate } = req.query; // Get fromDate and toDate from the query parameters

  try {
    let orders = await adminHelper.getAllOrders(fromDate, toDate); // Pass the date range to the function

    res.render("admin/finance", {
      admin: true,
      layout: "admin-layout",
      administator,
      orders,     // Render the filtered orders
      fromDate,   // Pass back toDate and fromDate to display on the form
      toDate
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Server Error");
  }
});


router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let administator = req.session.admin;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("admin/order-products", {
      admin: true, layout: "admin-layout",
      administator,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  adminHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  adminHelper.cancelOrder(orderId).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  adminHelper.cancelAllOrders().then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.searchProduct(req.body).then((response) => {
    res.render("admin/search-result", { admin: true, layout: "admin-layout", administator, response });
  });
});


module.exports = router;
