var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {



  ///////ADD workspace/////////////////////                                         
  addservice: (service, driverId, callback) => {
    if (!driverId || !objectId.isValid(driverId)) {
      return callback(null, new Error("Invalid or missing driverId"));
    }

    service.Price = parseInt(service.Price);
    service.driverId = objectId(driverId); // Associate service with the driver

    db.get()
      .collection(collections.SERVICE_COLLECTION)
      .insertOne(service)
      .then((data) => {
        callback(data.ops[0]._id); // Return the inserted service ID
      })
      .catch((error) => {
        callback(null, error);
      });
  },


  ///////GET ALL workspace/////////////////////                                            
  getAllservices: (driverId) => {
    return new Promise(async (resolve, reject) => {
      let services = await db
        .get()
        .collection(collections.SERVICE_COLLECTION)
        .find({ driverId: objectId(driverId) }) // Filter by driverId
        .toArray();
      resolve(services);
    });
  },

  ///////ADD service DETAILS/////////////////////                                            
  getserviceDetails: (serviceId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SERVICE_COLLECTION)
        .findOne({
          _id: objectId(serviceId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE service/////////////////////                                            
  deleteservice: (serviceId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SERVICE_COLLECTION)
        .removeOne({
          _id: objectId(serviceId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE service/////////////////////                                            
  updateservice: (serviceId, serviceDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SERVICE_COLLECTION)
        .updateOne(
          {
            _id: objectId(serviceId)
          },
          {
            $set: {
              wname: serviceDetails.wname,
              seat: serviceDetails.seat,
              Price: serviceDetails.Price,
              format: serviceDetails.format,
              desc: serviceDetails.desc,
              baddress: serviceDetails.baddress,

            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL service/////////////////////                                            
  deleteAllservices: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SERVICE_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },



  ///////ADD notification/////////////////////                                         
  addnotification: (notification, callback) => {
    console.log(notification);
    notification.Price = parseInt(notification.Price);
    db.get()
      .collection(collections.NOTIFICATION_COLLECTION)
      .insertOne(notification)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  ///////GET ALL notification/////////////////////                                            
  getAllnotifications: () => {
    return new Promise(async (resolve, reject) => {
      let notifications = await db
        .get()
        .collection(collections.NOTIFICATION_COLLECTION)
        .find()
        .toArray();
      resolve(notifications);
    });
  },

  ///////ADD notification DETAILS/////////////////////                                            
  getnotificationDetails: (notificationId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.NOTIFICATION_COLLECTION)
        .findOne({
          _id: objectId(notificationId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE notification/////////////////////                                            
  deletenotification: (notificationId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.NOTIFICATION_COLLECTION)
        .removeOne({
          _id: objectId(notificationId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE notification/////////////////////                                            
  updatenotification: (notificationId, notificationDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.NOTIFICATION_COLLECTION)
        .updateOne(
          {
            _id: objectId(notificationId)
          },
          {
            $set: {
              Name: notificationDetails.Name,
              Category: notificationDetails.Category,
              Price: notificationDetails.Price,
              Description: notificationDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL notification/////////////////////                                            
  deleteAllnotifications: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.NOTIFICATION_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },



  getFeedbackByDriverId: (driverId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const feedbacks = await db.get()
          .collection(collections.FEEDBACK_COLLECTION)
          .find({ driverId: objectId(driverId) }) // Convert driverId to ObjectId
          .toArray();
        resolve(feedbacks);
      } catch (error) {
        reject(error);
      }
    });
  },



  addProduct: (product, callback) => {
    console.log(product);
    product.Price = parseInt(product.Price);
    db.get()
      .collection(collections.PRODUCTS_COLLECTION)
      .insertOne(product)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },

  dosignup: (driverData) => {
    return new Promise(async (resolve, reject) => {
      try {
        driverData.Password = await bcrypt.hash(driverData.Password, 10);
        driverData.approved = false; // Set approved to false initially
        const data = await db.get().collection(collections.DRIVER_COLLECTION).insertOne(driverData);
        resolve(data.ops[0]);
      } catch (error) {
        reject(error);
      }
    });
  },


  doSignin: (driverData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let driver = await db
        .get()
        .collection(collections.DRIVER_COLLECTION)
        .findOne({ Email: driverData.Email });
      if (driver) {
        if (driver.rejected) {
          console.log("User is rejected");
          resolve({ status: "rejected" });
        } else {
          bcrypt.compare(driverData.Password, driver.Password).then((status) => {
            if (status) {
              if (driver.approved) {
                console.log("Login Success");
                response.driver = driver;
                response.status = true;
              } else {
                console.log("User not approved");
                response.status = "pending";
              }
              resolve(response);
            } else {
              console.log("Login Failed - Incorrect Password");
              resolve({ status: false });
            }
          });
        }
      } else {
        console.log("Login Failed - Email not found");
        resolve({ status: false });
      }
    });
  },


  getProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .findOne({ _id: objectId(productId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .removeOne({ _id: objectId(productId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  updateProduct: (productId, productDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $set: {
              Name: productDetails.Name,
              Category: productDetails.Category,
              Price: productDetails.Price,
              Description: productDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  deleteAllProducts: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  removeUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .removeOne({ _id: objectId(userId) })
        .then(() => {
          resolve();
        });
    });
  },

  removeAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  getAllOrders: (driverId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .find({ "driverId": objectId(driverId) }) // Filter by driver ID
          .toArray();
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },

  getAllServiceOrders: (driverId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let serviceorders = await db
          .get()
          .collection(collections.SERVICE_ORDER_COLLECTION)
          .find({ "driverId": objectId(driverId) }) // Filter by driver ID
          .toArray();
        resolve(serviceorders);
      } catch (error) {
        reject(error);
      }
    });
  },

  changeStatus: (status, orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SERVICE_ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              "status": status,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  cancelOrder: async (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Fetch the order to get the associated workspace ID
        const order = await db.get()
          .collection(collections.SERVICE_ORDER_COLLECTION)
          .findOne({ _id: objectId(orderId) });

        if (!order) {
          return reject(new Error("Order not found."));
        }


      } catch (error) {
        console.error("Error canceling order:", error);
        reject(error);
      }
    });
  },


  cancelAllOrders: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  searchProduct: (details) => {
    console.log(details);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .createIndex({ Name: "text" }).then(async () => {
          let result = await db
            .get()
            .collection(collections.PRODUCTS_COLLECTION)
            .find({
              $text: {
                $search: details.search,
              },
            })
            .toArray();
          resolve(result);
        })

    });
  },
};
