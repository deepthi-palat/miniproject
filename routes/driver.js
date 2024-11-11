var express = require("express");
var driverHelper = require("../helper/driverHelper");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
var router = express.Router();
var db = require("../config/connection");
var collections = require("../config/collections");
const ObjectId = require("mongodb").ObjectID;


const verifySignedIn = (req, res, next) => {
  if (req.session.signedInDriver) {
    next();
  } else {
    res.redirect("/driver/signin");
  }
};

/* GET admins listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let driver = req.session.driver;
  res.render("driver/home", { driver: true, layout: "layout", driver });
});


///////ALL notification/////////////////////                                         
router.get("/all-notifications", verifySignedIn, function (req, res) {
  let driver = req.session.driver;
  driverHelper.getAllnotifications().then((notifications) => {
    res.render("driver/all-notifications", { driver: true, layout: "layout", notifications, driver });
  });
});

///////ADD notification/////////////////////                                         
router.get("/add-notification", verifySignedIn, function (req, res) {
  let driver = req.session.driver;
  res.render("driver/all-notifications", { driver: true, layout: "layout", driver });
});

///////ADD notification/////////////////////                                         
router.post("/add-notification", function (req, res) {
  driverHelper.addnotification(req.body, (id) => {
    res.redirect("/driver/all-notifications");
  });
});

///////EDIT notification/////////////////////                                         
router.get("/edit-notification/:id", verifySignedIn, async function (req, res) {
  let driver = req.session.driver;
  let notificationId = req.params.id;
  let notification = await driverHelper.getnotificationDetails(notificationId);
  console.log(notification);
  res.render("driver/edit-notification", { driver: true, layout: "layout", notification, driver });
});

///////EDIT notification/////////////////////                                         
router.post("/edit-notification/:id", verifySignedIn, function (req, res) {
  let notificationId = req.params.id;
  driverHelper.updatenotification(notificationId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/notification-images/" + notificationId + ".png");
      }
    }
    res.redirect("/driver/all-notifications");
  });
});

///////DELETE notification/////////////////////                                         
router.get("/delete-notification/:id", verifySignedIn, function (req, res) {
  let notificationId = req.params.id;
  driverHelper.deletenotification(notificationId).then((response) => {
    res.redirect("/driver/all-notifications");
  });
});

///////DELETE ALL notification/////////////////////                                         
router.get("/delete-all-notifications", verifySignedIn, function (req, res) {
  driverHelper.deleteAllnotifications().then(() => {
    res.redirect("/driver/all-notifications");
  });
});


////////////////////PROFILE////////////////////////////////////
router.get("/profile", async function (req, res, next) {
  let driver = req.session.driver;
  res.render("driver/profile", { driver: true, layout: "layout", driver });
});


///////ALL workspace/////////////////////                                         
// router.get("/all-feedbacks", verifySignedIn, async function (req, res) {
//   let driver = req.session.driver;

//   const workspaceId = req.params.id;

//   console.log('workspace')

//   try {
//     const workspace = await userHelper.getWorkspaceById(workspaceId);
//     const feedbacks = await userHelper.getFeedbackByWorkspaceId(workspaceId); // Fetch feedbacks for the specific workspace
//     console.log('feedbacks', feedbacks)
//     res.render("driver/all-feedbacks", { driver: true, layout: "layout", workspace, feedbacks, driver });
//   } catch (error) {
//     console.error("Error fetching workspace:", error);
//     res.status(500).send("Server Error");
//   }

// });


router.get("/driver-feedback", async function (req, res) {
  let driver = req.session.driver; // Get the driver from session

  if (!driver) {
    return res.status(403).send("Driver not logged in");
  }

  try {
    // Fetch feedback for this driver
    const feedbacks = await driverHelper.getFeedbackByDriverId(driver._id);

    // Fetch workspace details for each feedback
    const feedbacksWithWorkspaces = await Promise.all(feedbacks.map(async feedback => {
      const workspace = await userHelper.getWorkspaceById(ObjectId(feedback.workspaceId)); // Convert workspaceId to ObjectId
      if (workspace) {
        feedback.workspaceName = workspace.name; // Attach workspace name to feedback
      }
      return feedback;
    }));

    // Render the feedback page with driver, feedbacks, and workspace data
    res.render("driver/all-feedbacks", {
      driver,  // Driver details
      feedbacks: feedbacksWithWorkspaces // Feedback with workspace details
    });
  } catch (error) {
    console.error("Error fetching feedback and workspaces:", error);
    res.status(500).send("Server Error");
  }
});



///////ALL workspace/////////////////////                                         
router.get("/all-services", verifySignedIn, function (req, res) {
  let driver = req.session.driver;
  driverHelper.getAllservices(req.session.driver._id).then((services) => {
    res.render("driver/all-services", { driver: true, layout: "layout", services, driver });
  });
});

///////ADD workspace/////////////////////                                         
router.get("/add-service", verifySignedIn, function (req, res) {
  let driver = req.session.driver;
  res.render("driver/add-service", { driver: true, layout: "layout", driver });
});

///////ADD service/////////////////////                                         
router.post("/add-service", function (req, res) {
  // Ensure the driver is signed in and their ID is available
  if (req.session.signedInDriver && req.session.driver && req.session.driver._id) {
    const driverId = req.session.driver._id; // Get the driver's ID from the session

    // Pass the driverId to the addservice function
    driverHelper.addservice(req.body, driverId, (serviceId, error) => {
      if (error) {
        console.log("Error adding service:", error);
        res.status(500).send("Failed to add service");
      } else {
        let image = req.files.Image;
        image.mv("./public/images/service-images/" + serviceId + ".png", (err) => {
          if (!err) {
            res.redirect("/driver/all-services");
          } else {
            console.log("Error saving service image:", err);
            res.status(500).send("Failed to save service image");
          }
        });
      }
    });
  } else {
    // If the driver is not signed in, redirect to the sign-in page
    res.redirect("/driver/signin");
  }
});


///////EDIT service/////////////////////                                         
router.get("/edit-service/:id", verifySignedIn, async function (req, res) {
  let driver = req.session.driver;
  let serviceId = req.params.id;
  let service = await driverHelper.getserviceDetails(serviceId);
  console.log(service);
  res.render("driver/edit-service", { driver: true, layout: "layout", service, driver });
});

///////EDIT service/////////////////////                                         
router.post("/edit-service/:id", verifySignedIn, function (req, res) {
  let serviceId = req.params.id;
  driverHelper.updateservice(serviceId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/service-images/" + serviceId + ".png");
      }
    }
    res.redirect("/driver/all-services");
  });
});

///////DELETE service/////////////////////                                         
router.get("/delete-service/:id", verifySignedIn, function (req, res) {
  let serviceId = req.params.id;
  driverHelper.deleteservice(serviceId).then((response) => {
    fs.unlinkSync("./public/images/service-images/" + serviceId + ".png");
    res.redirect("/driver/all-services");
  });
});

///////DELETE ALL service/////////////////////                                         
router.get("/delete-all-services", verifySignedIn, function (req, res) {
  driverHelper.deleteAllservices().then(() => {
    res.redirect("/driver/all-services");
  });
});


router.get("/all-users", verifySignedIn, async function (req, res) {
  let driver = req.session.driver;

  // Ensure you have the driver's ID available
  let driverId = driver._id; // Adjust based on how driver ID is stored in session

  // Pass driverId to getAllOrders
  let orders = await driverHelper.getAllOrders(driverId);

  res.render("driver/all-users", {
    driver: true,
    layout: "layout",
    orders,
    driver
  });
});

router.get("/all-transactions", verifySignedIn, async function (req, res) {
  let driver = req.session.driver;

  // Ensure you have the driver's ID available
  let driverId = driver._id; // Adjust based on how driver ID is stored in session

  // Pass driverId to getAllOrders
  let orders = await driverHelper.getAllOrders(driverId);

  res.render("driver/all-transactions", {
    driver: true,
    layout: "layout",
    orders,
    driver
  });
});

router.get("/pending-approval", function (req, res) {
  if (!req.session.signedInDriver || req.session.driver.approved) {
    res.redirect("/driver");
  } else {
    res.render("driver/pending-approval", {
      driver: true, layout: "empty",
    });
  }
});


router.get("/signup", function (req, res) {
  if (req.session.signedInDriver) {
    res.redirect("/driver");
  } else {
    res.render("driver/signup", {
      driver: true, layout: "empty",
      signUpErr: req.session.signUpErr,
    });
  }
});

router.post("/signup", async function (req, res) {
  const { Companyname, Email, Phone, Address, City, Pincode, Password } = req.body;
  let errors = {};

  // Field validations
  if (!Companyname) errors.Companyname = "Please enter your company name.";
  if (!Email) errors.email = "Please enter your email.";
  if (!Phone) errors.phone = "Please enter your phone number.";
  if (!Address) errors.address = "Please enter your address.";
  if (!City) errors.city = "Please enter your city.";
  if (!Pincode) errors.pincode = "Please enter your pincode.";
  if (!Password) errors.password = "Please enter a password.";

  // Check if email, company name, or phone already exists
  const existingEmail = await db.get().collection(collections.DRIVER_COLLECTION).findOne({ Email });
  if (existingEmail) errors.email = "This email is already registered.";

  const existingCompanyname = await db.get().collection(collections.DRIVER_COLLECTION).findOne({ Companyname });
  if (existingCompanyname) errors.Companyname = "This company name is already registered.";

  const existingPhone = await db.get().collection(collections.DRIVER_COLLECTION).findOne({ Phone });
  if (existingPhone) errors.phone = "This phone number is already registered.";

  // Validate Pincode and Phone
  if (!/^\d{6}$/.test(Pincode)) errors.pincode = "Pincode must be exactly 6 digits.";
  if (!/^\d{10}$/.test(Phone)) errors.phone = "Phone number must be exactly 10 digits.";

  // If there are validation errors, re-render the form
  if (Object.keys(errors).length > 0) {
    return res.render("driver/signup", {
      driver: true,
      layout: 'empty',
      errors,
      Companyname,
      Email,
      Phone,
      Address,
      City,
      Pincode,
      Password
    });
  }

  // Perform signup
  driverHelper.dosignup(req.body).then((response) => {
    if (!response) {
      req.session.signUpErr = "Invalid Admin Code";
      return res.redirect("/driver/signup");
    }

    // Extract the id properly, assuming it's part of an object (like MongoDB ObjectId)
    const id = response._id ? response._id.toString() : response.toString();

    // Ensure directories for images and PDFs exist
    const imageDir = "./public/images/driver-images/";
    const pdfDir = "./public/driver-pdf/";

    if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    // Handle image upload
    if (req.files && req.files.Image) {
      let image = req.files.Image;
      let imagePath = imageDir + id + ".png";

      image.mv(imagePath, (err) => {
        if (err) {
          console.log("Error saving image:", err);
          return res.status(500).send("Error uploading image");
        }
      });
    }

    // Handle PDF upload
    if (req.files && req.files.Pdf) {
      let pdf = req.files.Pdf;
      let pdfPath = pdfDir + id + ".pdf";  // Save PDF with driver's ID as the filename

      pdf.mv(pdfPath, (err) => {
        if (err) {
          console.log("Error saving PDF:", err);
          return res.status(500).send("Error uploading PDF");
        }
      });
    }

    // Set session and redirect
    req.session.signedInDriver = true;
    req.session.driver = response;
    res.redirect("/driver/pending-approval");
  }).catch((err) => {
    console.log("Error during signup:", err);
    res.status(500).send("Error during signup");
  });
});


router.get("/signin", function (req, res) {
  if (req.session.signedInDriver) {
    res.redirect("/driver");
  } else {
    res.render("driver/signin", {
      driver: true, layout: "empty",
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  const { Email, Password } = req.body;

  // Validate Email and Password
  if (!Email || !Password) {
    req.session.signInErr = "Please fill all fields.";
    return res.redirect("/driver/signin");
  }

  driverHelper.doSignin(req.body)
    .then((response) => {
      if (response.status === true) {
        req.session.signedInDriver = true;
        req.session.driver = response.driver;
        res.redirect("/driver");
      } else if (response.status === "pending") {
        req.session.signInErr = "This user is not approved by admin, please wait.";
        res.redirect("/driver/signin");
      } else if (response.status === "rejected") {
        req.session.signInErr = "This user is rejected by admin.";
        res.redirect("/driver/signin");
      } else {
        req.session.signInErr = "Invalid Email/Password";
        res.redirect("/driver/signin");
      }
    })
    .catch((error) => {
      console.error(error);
      req.session.signInErr = "An error occurred. Please try again.";
      res.redirect("/driver/signin");
    });
});




router.get("/signout", function (req, res) {
  req.session.signedInDriver = false;
  req.session.driver = null;
  res.redirect("/driver");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let driver = req.session.driver;
  res.render("driver/add-product", { driver: true, layout: "layout", workspace });
});

router.post("/add-product", function (req, res) {
  driverHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/driver/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let driver = req.session.driver;
  let productId = req.params.id;
  let product = await driverHelper.getProductDetails(productId);
  console.log(product);
  res.render("driver/edit-product", { driver: true, layout: "layout", product, workspace });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  driverHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/driver/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  driverHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/driver/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  driverHelper.deleteAllProducts().then(() => {
    res.redirect("/driver/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let driver = req.session.driver;
  driverHelper.getAllUsers().then((users) => {
    res.render("driver/users/all-users", { driver: true, layout: "layout", workspace, users });
  });
});

router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  driverHelper.removeUser(userId).then(() => {
    res.redirect("/driver/all-users");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  driverHelper.removeAllUsers().then(() => {
    res.redirect("/driver/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let driver = req.session.driver;

  // Ensure you have the driver's ID available
  let driverId = driver._id; // Adjust based on how driver ID is stored in session

  // Pass driverId to getAllOrders
  let serviceorders = await driverHelper.getAllServiceOrders(driverId);

  res.render("driver/all-orders", {
    driver: true,
    layout: "layout",
    serviceorders,
    driver
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let driver = req.session.driver;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("driver/order-products", {
      driver: true, layout: "layout",
      workspace,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  driverHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/driver/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  driverHelper.cancelOrder(orderId).then(() => {
    res.redirect("/driver/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  driverHelper.cancelAllOrders().then(() => {
    res.redirect("/driver/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let driver = req.session.driver;
  driverHelper.searchProduct(req.body).then((response) => {
    res.render("driver/search-result", { driver: true, layout: "layout", workspace, response });
  });
});


module.exports = router;
