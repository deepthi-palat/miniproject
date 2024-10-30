var express = require("express");
var providerHelper = require("../helper/providerHelper");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
var router = express.Router();
var db = require("../config/connection");
var collections = require("../config/collections");
const ObjectId = require("mongodb").ObjectID;


const verifySignedIn = (req, res, next) => {
  if (req.session.signedInProvider) {
    next();
  } else {
    res.redirect("/provider/signin");
  }
};

/* GET admins listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let provider = req.session.provider;
  res.render("provider/home", { provider: true, layout: "layout", provider });
});


///////ALL notification/////////////////////                                         
router.get("/all-notifications", verifySignedIn, function (req, res) {
  let provider = req.session.provider;
  providerHelper.getAllnotifications().then((notifications) => {
    res.render("provider/all-notifications", { provider: true, layout: "layout", notifications, provider });
  });
});

///////ADD notification/////////////////////                                         
router.get("/add-notification", verifySignedIn, function (req, res) {
  let provider = req.session.provider;
  res.render("provider/all-notifications", { provider: true, layout: "layout", provider });
});

///////ADD notification/////////////////////                                         
router.post("/add-notification", function (req, res) {
  providerHelper.addnotification(req.body, (id) => {
    res.redirect("/provider/all-notifications");
  });
});

///////EDIT notification/////////////////////                                         
router.get("/edit-notification/:id", verifySignedIn, async function (req, res) {
  let provider = req.session.provider;
  let notificationId = req.params.id;
  let notification = await providerHelper.getnotificationDetails(notificationId);
  console.log(notification);
  res.render("provider/edit-notification", { provider: true, layout: "layout", notification, provider });
});

///////EDIT notification/////////////////////                                         
router.post("/edit-notification/:id", verifySignedIn, function (req, res) {
  let notificationId = req.params.id;
  providerHelper.updatenotification(notificationId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/notification-images/" + notificationId + ".png");
      }
    }
    res.redirect("/provider/all-notifications");
  });
});

///////DELETE notification/////////////////////                                         
router.get("/delete-notification/:id", verifySignedIn, function (req, res) {
  let notificationId = req.params.id;
  providerHelper.deletenotification(notificationId).then((response) => {
    res.redirect("/provider/all-notifications");
  });
});

///////DELETE ALL notification/////////////////////                                         
router.get("/delete-all-notifications", verifySignedIn, function (req, res) {
  providerHelper.deleteAllnotifications().then(() => {
    res.redirect("/provider/all-notifications");
  });
});


////////////////////PROFILE////////////////////////////////////
router.get("/profile", async function (req, res, next) {
  let provider = req.session.provider;
  res.render("provider/profile", { provider: true, layout: "layout", provider });
});


///////ALL workspace/////////////////////                                         
// router.get("/all-feedbacks", verifySignedIn, async function (req, res) {
//   let provider = req.session.provider;

//   const workspaceId = req.params.id;

//   console.log('workspace')

//   try {
//     const workspace = await userHelper.getWorkspaceById(workspaceId);
//     const feedbacks = await userHelper.getFeedbackByWorkspaceId(workspaceId); // Fetch feedbacks for the specific workspace
//     console.log('feedbacks', feedbacks)
//     res.render("provider/all-feedbacks", { provider: true, layout: "layout", workspace, feedbacks, provider });
//   } catch (error) {
//     console.error("Error fetching workspace:", error);
//     res.status(500).send("Server Error");
//   }

// });


router.get("/provider-feedback", async function (req, res) {
  let provider = req.session.provider; // Get the provider from session

  if (!provider) {
    return res.status(403).send("Provider not logged in");
  }

  try {
    // Fetch feedback for this provider
    const feedbacks = await providerHelper.getFeedbackByProviderId(provider._id);

    // Fetch workspace details for each feedback
    const feedbacksWithWorkspaces = await Promise.all(feedbacks.map(async feedback => {
      const workspace = await userHelper.getWorkspaceById(ObjectId(feedback.workspaceId)); // Convert workspaceId to ObjectId
      if (workspace) {
        feedback.workspaceName = workspace.name; // Attach workspace name to feedback
      }
      return feedback;
    }));

    // Render the feedback page with provider, feedbacks, and workspace data
    res.render("provider/all-feedbacks", {
      provider,  // Provider details
      feedbacks: feedbacksWithWorkspaces // Feedback with workspace details
    });
  } catch (error) {
    console.error("Error fetching feedback and workspaces:", error);
    res.status(500).send("Server Error");
  }
});



///////ALL workspace/////////////////////                                         
router.get("/all-workspaces", verifySignedIn, function (req, res) {
  let provider = req.session.provider;
  providerHelper.getAllworkspaces(req.session.provider._id).then((workspaces) => {
    res.render("provider/all-workspaces", { provider: true, layout: "layout", workspaces, provider });
  });
});

///////ADD workspace/////////////////////                                         
router.get("/add-workspace", verifySignedIn, function (req, res) {
  let provider = req.session.provider;
  res.render("provider/add-workspace", { provider: true, layout: "layout", provider });
});

///////ADD workspace/////////////////////                                         
router.post("/add-workspace", function (req, res) {
  // Ensure the provider is signed in and their ID is available
  if (req.session.signedInProvider && req.session.provider && req.session.provider._id) {
    const providerId = req.session.provider._id; // Get the provider's ID from the session

    // Pass the providerId to the addworkspace function
    providerHelper.addworkspace(req.body, providerId, (workspaceId, error) => {
      if (error) {
        console.log("Error adding workspace:", error);
        res.status(500).send("Failed to add workspace");
      } else {
        let image = req.files.Image;
        image.mv("./public/images/workspace-images/" + workspaceId + ".png", (err) => {
          if (!err) {
            res.redirect("/provider/all-workspaces");
          } else {
            console.log("Error saving workspace image:", err);
            res.status(500).send("Failed to save workspace image");
          }
        });
      }
    });
  } else {
    // If the provider is not signed in, redirect to the sign-in page
    res.redirect("/provider/signin");
  }
});


///////EDIT workspace/////////////////////                                         
router.get("/edit-workspace/:id", verifySignedIn, async function (req, res) {
  let provider = req.session.provider;
  let workspaceId = req.params.id;
  let workspace = await providerHelper.getworkspaceDetails(workspaceId);
  console.log(workspace);
  res.render("provider/edit-workspace", { provider: true, layout: "layout", workspace, provider });
});

///////EDIT workspace/////////////////////                                         
router.post("/edit-workspace/:id", verifySignedIn, function (req, res) {
  let workspaceId = req.params.id;
  providerHelper.updateworkspace(workspaceId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/workspace-images/" + workspaceId + ".png");
      }
    }
    res.redirect("/provider/all-workspaces");
  });
});

///////DELETE workspace/////////////////////                                         
router.get("/delete-workspace/:id", verifySignedIn, function (req, res) {
  let workspaceId = req.params.id;
  providerHelper.deleteworkspace(workspaceId).then((response) => {
    fs.unlinkSync("./public/images/workspace-images/" + workspaceId + ".png");
    res.redirect("/provider/all-workspaces");
  });
});

///////DELETE ALL workspace/////////////////////                                         
router.get("/delete-all-workspaces", verifySignedIn, function (req, res) {
  providerHelper.deleteAllworkspaces().then(() => {
    res.redirect("/provider/all-workspaces");
  });
});


router.get("/all-users", verifySignedIn, async function (req, res) {
  let provider = req.session.provider;

  // Ensure you have the provider's ID available
  let providerId = provider._id; // Adjust based on how provider ID is stored in session

  // Pass providerId to getAllOrders
  let orders = await providerHelper.getAllOrders(providerId);

  res.render("provider/all-users", {
    provider: true,
    layout: "layout",
    orders,
    provider
  });
});

router.get("/all-transactions", verifySignedIn, async function (req, res) {
  let provider = req.session.provider;

  // Ensure you have the provider's ID available
  let providerId = provider._id; // Adjust based on how provider ID is stored in session

  // Pass providerId to getAllOrders
  let orders = await providerHelper.getAllOrders(providerId);

  res.render("provider/all-transactions", {
    provider: true,
    layout: "layout",
    orders,
    provider
  });
});

router.get("/pending-approval", function (req, res) {
  if (!req.session.signedInProvider || req.session.provider.approved) {
    res.redirect("/provider");
  } else {
    res.render("provider/pending-approval", {
      provider: true, layout: "empty",
    });
  }
});


router.get("/signup", function (req, res) {
  if (req.session.signedInProvider) {
    res.redirect("/provider");
  } else {
    res.render("provider/signup", {
      provider: true, layout: "empty",
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

  // Check if email or company name already exists
  const existingEmail = await db.get()
    .collection(collections.PROVIDER_COLLECTION)
    .findOne({ Email });
  if (existingEmail) errors.email = "This email is already registered.";

  const existingCompanyname = await db.get()
    .collection(collections.PROVIDER_COLLECTION)
    .findOne({ Companyname });
  if (existingCompanyname) errors.Companyname = "This company name is already registered.";

  // Validate Pincode and Phone
  if (!/^\d{6}$/.test(Pincode)) errors.pincode = "Pincode must be exactly 6 digits.";
  if (!/^\d{10}$/.test(Phone)) errors.phone = "Phone number must be exactly 10 digits.";
  const existingPhone = await db.get()
    .collection(collections.PROVIDER_COLLECTION)
    .findOne({ Phone });
  if (existingPhone) errors.phone = "This phone number is already registered.";

  // If there are validation errors, re-render the form
  if (Object.keys(errors).length > 0) {
    return res.render("provider/signup", {
      provider: true,
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

  providerHelper.dosignup(req.body).then((response) => {
    if (!response) {
      req.session.signUpErr = "Invalid Admin Code";
      return res.redirect("/provider/signup");
    }

    // Extract the id properly, assuming it's part of an object (like MongoDB ObjectId)
    const id = response._id ? response._id.toString() : response.toString();

    // Ensure the images directory exists
    const imageDir = "./public/images/provider-images/";
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    // Handle image upload
    if (req.files && req.files.Image) {
      let image = req.files.Image;
      let imagePath = imageDir + id + ".png";  // Use the extracted id here

      console.log("Saving image to:", imagePath);  // Log the correct image path

      image.mv(imagePath, (err) => {
        if (!err) {
          // On successful image upload, redirect to pending approval
          req.session.signedInProvider = true;
          req.session.provider = response;
          res.redirect("/provider/pending-approval");
        } else {
          console.log("Error saving image:", err);  // Log any errors
          res.status(500).send("Error uploading image");
        }
      });
    } else {
      // No image uploaded, proceed without it
      req.session.signedInProvider = true;
      req.session.provider = response;
      res.redirect("/provider/pending-approval");
    }
  }).catch((err) => {
    console.log("Error during signup:", err);
    res.status(500).send("Error during signup");
  });
}),


  router.get("/signin", function (req, res) {
    if (req.session.signedInProvider) {
      res.redirect("/provider");
    } else {
      res.render("provider/signin", {
        provider: true, layout: "empty",
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
    return res.redirect("/provider/signin");
  }

  providerHelper.doSignin(req.body)
    .then((response) => {
      if (response.status === true) {
        req.session.signedInProvider = true;
        req.session.provider = response.provider;
        res.redirect("/provider");
      } else if (response.status === "pending") {
        req.session.signInErr = "This user is not approved by admin, please wait.";
        res.redirect("/provider/signin");
      } else if (response.status === "rejected") {
        req.session.signInErr = "This user is rejected by admin.";
        res.redirect("/provider/signin");
      } else {
        req.session.signInErr = "Invalid Email/Password";
        res.redirect("/provider/signin");
      }
    })
    .catch((error) => {
      console.error(error);
      req.session.signInErr = "An error occurred. Please try again.";
      res.redirect("/provider/signin");
    });
});




router.get("/signout", function (req, res) {
  req.session.signedInProvider = false;
  req.session.provider = null;
  res.redirect("/provider");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let provider = req.session.provider;
  res.render("provider/add-product", { provider: true, layout: "layout", workspace });
});

router.post("/add-product", function (req, res) {
  providerHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/provider/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let provider = req.session.provider;
  let productId = req.params.id;
  let product = await providerHelper.getProductDetails(productId);
  console.log(product);
  res.render("provider/edit-product", { provider: true, layout: "layout", product, workspace });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  providerHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/provider/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  providerHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/provider/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  providerHelper.deleteAllProducts().then(() => {
    res.redirect("/provider/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let provider = req.session.provider;
  providerHelper.getAllUsers().then((users) => {
    res.render("provider/users/all-users", { provider: true, layout: "layout", workspace, users });
  });
});

router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  providerHelper.removeUser(userId).then(() => {
    res.redirect("/provider/all-users");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  providerHelper.removeAllUsers().then(() => {
    res.redirect("/provider/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let provider = req.session.provider;

  // Ensure you have the provider's ID available
  let providerId = provider._id; // Adjust based on how provider ID is stored in session

  // Pass providerId to getAllOrders
  let orders = await providerHelper.getAllOrders(providerId);

  res.render("provider/all-orders", {
    provider: true,
    layout: "layout",
    orders,
    provider
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let provider = req.session.provider;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("provider/order-products", {
      provider: true, layout: "layout",
      workspace,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  providerHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/provider/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  providerHelper.cancelOrder(orderId).then(() => {
    res.redirect("/provider/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  providerHelper.cancelAllOrders().then(() => {
    res.redirect("/provider/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let provider = req.session.provider;
  providerHelper.searchProduct(req.body).then((response) => {
    res.render("provider/search-result", { provider: true, layout: "layout", workspace, response });
  });
});


module.exports = router;
