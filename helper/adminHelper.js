var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {

  ///////ADD provider/////////////////////                                         
  addprovider: (provider, callback) => {
    console.log(provider);
    provider.Price = parseInt(provider.Price);
    db.get()
      .collection(collections.PROVIDER_COLLECTION)
      .insertOne(provider)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  ///////GET ALL provider/////////////////////                                            
  getAllproviders: () => {
    return new Promise(async (resolve, reject) => {
      let providers = await db
        .get()
        .collection(collections.PROVIDER_COLLECTION)
        .find()
        .toArray();
      resolve(providers);
    });
  },

  ///////ADD provider DETAILS/////////////////////                                            
  getproviderDetails: (providerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PROVIDER_COLLECTION)
        .findOne({
          _id: objectId(providerId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE provider/////////////////////                                            
  deleteprovider: (providerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PROVIDER_COLLECTION)
        .removeOne({
          _id: objectId(providerId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE provider/////////////////////                                            
  updateprovider: (providerId, providerDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PROVIDER_COLLECTION)
        .updateOne(
          {
            _id: objectId(providerId)
          },
          {
            $set: {
              Name: providerDetails.Name,
              Category: providerDetails.Category,
              Price: providerDetails.Price,
              Description: providerDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL provider/////////////////////                                            
  deleteAllproviders: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PROVIDER_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
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

  doSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {
      if (adminData.Code == "admin123") {
        adminData.Password = await bcrypt.hash(adminData.Password, 10);
        db.get()
          .collection(collections.ADMIN_COLLECTION)
          .insertOne(adminData)
          .then((data) => {
            resolve(data.ops[0]);
          });
      } else {
        resolve({ status: false });
      }
    });
  },

  doSignin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let admin = await db
        .get()
        .collection(collections.ADMIN_COLLECTION)
        .findOne({ Email: adminData.Email });
      if (admin) {
        bcrypt.compare(adminData.Password, admin.Password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.admin = admin;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login Failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Login Failed");
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


  ///////GET ALL provider/////////////////////                                            
  getAlldrivers: () => {
    return new Promise(async (resolve, reject) => {
      let drivers = await db
        .get()
        .collection(collections.DRIVER_COLLECTION)
        .find()
        .toArray();
      resolve(drivers);
    });
  },

  ///////ADD driver DETAILS/////////////////////                                            
  getdriverDetails: (driverId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DRIVER_COLLECTION)
        .findOne({
          _id: objectId(driverId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE driver/////////////////////                                            
  deletedriver: (driverId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DRIVER_COLLECTION)
        .removeOne({
          _id: objectId(driverId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE driver/////////////////////                                            
  updatedriver: (driverId, driverDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DRIVER_COLLECTION)
        .updateOne(
          {
            _id: objectId(driverId)
          },
          {
            $set: {
              Name: driverDetails.Name,
              Category: driverDetails.Category,
              Price: driverDetails.Price,
              Description: driverDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL driver/////////////////////                                            
  deleteAlldrivers: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DRIVER_COLLECTION)
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

  getAllOrders: (fromDate, toDate) => {
    return new Promise(async (resolve, reject) => {
      try {
        let query = {};

        // If fromDate and toDate are provided, filter orders by the date range
        if (fromDate && toDate) {
          // Add one day to toDate and set it to midnight
          const adjustedToDate = new Date(toDate);
          adjustedToDate.setDate(adjustedToDate.getDate() + 1);

          query = {
            date: {
              $gte: new Date(fromDate), // Orders from the start date
              $lt: adjustedToDate       // Orders up to the end of the toDate
            }
          };
        }

        let orders = await db.get()
          .collection(collections.ORDER_COLLECTION)
          .find(query)
          .toArray();

        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },


  getOrdersByDateRange: (fromDate, toDate) => {
    return new Promise(async (resolve, reject) => {
      try {
        const orders = await db.get()
          .collection(collections.ORDER_COLLECTION)
          .find({
            createdAt: {
              $gte: new Date(fromDate), // Greater than or equal to the fromDate
              $lte: new Date(toDate)    // Less than or equal to the toDate
            }
          })
          .toArray();
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },

  changeStatus: (status, orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              "orderObject.status": status,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  cancelOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .removeOne({ _id: objectId(orderId) })
        .then(() => {
          resolve();
        });
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
