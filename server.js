const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
// Enable CORS for all routes
app.use(cors());
const port = 3001;
const EMAIL_SENDER = 'proauthnotifier@gmail.com';

mongoose.connect('mongodb://127.0.0.1:27017/proauth_db', {});

const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  username: String,
  password: String,
  address: String,
  email: String,
  role: String,
  status: Boolean,
  createdBy: String,
  createdAt: Date
});

const userMobileSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  username: String,
  password: String,
  address: String,
  email: String,
  phone: String,
  country: String,
  notifiedbymail: Boolean,
  status: Boolean,
  createdAt: Date
});

const categorySchema = new mongoose.Schema({
  categoryname: String,
  categoryreference: String,
  description: String,
  createdBy: String,
  createdAt: Date
});

const productSchema = new mongoose.Schema({
  productId: Number,
  productName: String,
  productReference: String,
  manufacturer: String,
  madeIn: String,
  price: Number,
  warranty: Number,
  yearOfRelease: Number,
  description: String,
  category: String,
  createdBy: String,
  uid_hash: String,
  createdAt: Date
});

const visitLogSchema = new mongoose.Schema({
  username: String,
  loggedInAt: Date
});

const requestLogSchema = new mongoose.Schema({
  productId: Number,
  productReference: String,
  uid_hash: String,
  productName: String,
  manufacturer: String,
  madeIn: String,
  yearOfRelease: Number,
  productIdExists: String,
  productRefExists: String,
  productUidExists: String,
  requestedBy: String,
  result: String,
  createdAt: Date
});


const User = mongoose.model('User', userSchema);
const UserMobile = mongoose.model('Mobile_User', userMobileSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const RequestLog = mongoose.model('Request_Log', requestLogSchema);
const VisitLog = mongoose.model('Visit_Log', visitLogSchema);

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_SENDER,
    pass: 'tcgmcymiwvzjgsxh'
  }
});

// Create a new user - Web
app.post('/register-web-user', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      const existingUser = await User.findOne({ username });
      const existingUserEmail = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).send('Username already taken');
      }

      if (existingUserEmail) {
        return res.status(400).send('Email already registered for another user');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = new User({
        ...req.body,
        password: hashedPassword,
        status: true,
        createdAt: new Date()
      });
  
      await user.save();
      res.status(201).send('User registered');
    } catch (error) {
      res.status(500).send('Registration failed');
    }
  });

// Retrieve all users - Web
app.get('/web-users', async (req, res) => {
    try {
      const users = await User.find({}, '-password'); // Exclude password field
      res.status(200).send(users);
    } catch (error) {
      res.status(500).send('Error retrieving users');
    }
  });

// Retrieve a user by username and password - Web login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send('Invalid password');
    }

    res.status(200).send('Login successful');
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// Searching a user by firstname,lastname,username or email - Web login
app.get('/users/search', async (req, res) => {
  try {
    const { firstname, lastname, username, email } = req.query;
    let query = {};

    if (firstname) {
      query = { firstname: firstname };
    } else if (lastname) {
      query = { lastname: { $regex: new RegExp(lastname, 'i') } };
    }else if (username) {
      query = { username: { $regex: new RegExp(username, 'i') } };
    }else if (email) {
      query = { email: { $regex: new RegExp(email, 'i') } };
    }

    const user = await User.find(query, '-password');
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

});

// Create a new user - Mobile
app.post('/register-mobile-user', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      const existingUser = await UserMobile.findOne({ username });
      const existingUserEmail = await UserMobile.findOne({ email });
  
      if (existingUser) {
        return res.status(400).send('Username already taken');
      }

      if (existingUserEmail) {
        return res.status(400).send('Email already registered for another user');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const userMobile = new UserMobile({
        ...req.body,
        password: hashedPassword,
        status: true,
        createdAt: new Date()
      });
  
      await userMobile.save();
      res.status(201).send('User registered');
    } catch (error) {
      res.status(500).send('Registration failed');
    }
  });

  // Retrieve all users - Mobile
app.get('/mobile-users', async (req, res) => {
    try {
      const mobileUsers = await UserMobile.find({}, '-password'); // Exclude password field
      res.status(200).send(mobileUsers);
    } catch (error) {
      res.status(500).send('Error retrieving mobile users');
    }
  });

// Retrieve a user by username and password - Mobile login
app.post('/login-mob', async (req, res) => {
  try {
    const { username, password } = req.body;
    const userMobile = await UserMobile.findOne({ username });

    if (!userMobile) {
      return res.status(401).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, userMobile.password);

    if (!isMatch) {
      return res.status(401).send('Invalid password');
    }
    //Capture logged in
    const loggedUser = new VisitLog({
      ...req.body,
      loggedInAt: new Date()
    });
    await loggedUser.save();

    res.status(200).send('Login successful');
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// Change Password - Mobile
app.post('/change-pwd-mob', async (req, res) => {
  try {
    const { username, password, newPassword } = req.body;
    const userMobile = await UserMobile.findOne({ username });

    if (!userMobile) {
      return res.status(404).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, userMobile.password);

    if (!isMatch) {
      return res.status(401).send('Invalid password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserMobile.findOneAndUpdate({ username }, { password: hashedPassword });

    res.status(200).send('Password updated successfully');
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// Searching a user by firstname,lastname,username or email - Mobile
app.get('/mobile-users/search', async (req, res) => {
  try {
    const { firstname, lastname, username, email } = req.query;
    let query = {};

    if (firstname) {
      query = { firstname: firstname };
    } else if (lastname) {
      query = { lastname: { $regex: new RegExp(lastname, 'i') } };
    }else if (username) {
      query = { username: { $regex: new RegExp(username, 'i') } };
    }else if (email) {
      query = { email: { $regex: new RegExp(email, 'i') } };
    }

    //const userMobile = await UserMobile.find(query);
    const userMobile = await UserMobile.find(query, '-password'); // Exclude password field
    res.status(200).json(userMobile);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

});

// Create a new Category
app.post('/add-category', async (req, res) => {
  try {
    const { categoryname, categoryreference } = req.body;
    const existingCategoryName = await Category.findOne({ categoryname });
    const existingCategoryReference = await Category.findOne({ categoryreference });

    if (existingCategoryName || existingCategoryReference) {
      return res.status(400).send('Category name or reference already exist');
    }

    const category = new Category({
      ...req.body,
      createdAt: new Date()
    });

    await category.save();
    res.status(201).send('Category added successfully');
  } catch (error) {
    res.status(500).send('Failed: Category has not been added');
  }
});

// Retrieve all Categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).send(categories);
  } catch (error) {
    res.status(500).send('Error retrieving categories');
  }
});

// Search all Category by Id or name or Reference
app.get('/categories/search', async (req, res) => {
  try {
    const { id, categoryname, categoryreference } = req.query;
    let query = {};

    if (id) {
      query = { _id: id };
    } else if (categoryname) {
      query = { categoryname: { $regex: new RegExp(categoryname, 'i') } };
    }else if (categoryreference) {
      query = { categoryreference: { $regex: new RegExp(categoryreference, 'i') } };
    }

    // Search user by ID or name or reference
    const categories = await Category.find(query);

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Create a new Product
app.post('/add-product', async (req, res) => {
  try {
    const { productId, productReference, uid_hash } = req.body;
    const existingProductId = await Product.findOne({ productId });
    const existingProductReference = await Product.findOne({ productReference });
    const existingProductHash = await Product.findOne({ uid_hash });

    if (existingProductId || existingProductReference || existingProductHash) {
      return res.status(400).send('Product ID or reference already exist');
    }

    const product = new Product({
      ...req.body,
      createdAt: new Date()
    });

    await product.save();
    res.status(201).send('Product added successfully');
  } catch (error) {
    res.status(500).send('Failed: Product has not been added');
  }
});

// Retrieve all Products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send('Error retrieving products');
  }
});

// Search all Product by Id or name or Reference
app.get('/products/search', async (req, res) => {
  try {
    const { productId, productName, productReference, uid_hash } = req.query;
    let query = {};

    if (productId) {
      query = { productId: { $regex: new RegExp(productId, 'i') } };
    } else if (productName) {
      query = { productName: { $regex: new RegExp(productName, 'i') } };
    }else if (productReference) {
      query = { productReference: { $regex: new RegExp(productReference, 'i') } };
    }else if (uid_hash) {
      query = { uid_hash: { $regex: new RegExp(uid_hash, 'i') } };
    }

    // Search product by ID or name or reference
    const products = await Product.find(query);

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Check Product authenticity
app.post('/authentify-product', async (req, res) => {
  try {
    
    const { productId, productReference, uid_hash, requestedBy } = req.body;
    const existingProductId = await Product.findOne({ productId });
    const existingProductReference = await Product.findOne({ productReference });
    const existingProductHash = await Product.findOne({ uid_hash });

    let query_find_requester_user = { username: requestedBy };
    const userToNotify = await UserMobile.find(query_find_requester_user, '-password'); // Exclude password field

    let productIdExists_V = 'NO';
    let productRefExists_V = 'NO';
    let productUidExists_V = 'NO';

    if(existingProductId){
      productIdExists_V = 'YES';
    }

    if(existingProductReference){
      productRefExists_V = 'YES';
    }

    if(existingProductHash){
      productUidExists_V = 'YES';
    }


    if (existingProductId && existingProductReference && existingProductHash) {
      const requestLog = new RequestLog({
        ...req.body,
        productName: existingProductId.productName,
        manufacturer: existingProductId.manufacturer,
        madeIn: existingProductId.madeIn,
        yearOfRelease: existingProductId.yearOfRelease,
        productIdExists: productIdExists_V,
        productRefExists: productRefExists_V,
        productUidExists: productUidExists_V,
        result: 'SUCCESS',
        createdAt: new Date()
      });
  
      await requestLog.save();

    //Send mail
    //const userToNotify = await UserMobile.find({ notifiedbymail: true });

    //console.log(`User: ${EMAIL_SENDER}`);
    // Send email notifications
    userToNotify.forEach(async (user) => {
      console.log(`Email: ${user.email}`);
      console.log(`USer: ${user.firstname}`);
      textToBeSendOnMail = `
      Hello ${user.firstname},\n
      A product with name: (${existingProductId.productName}) having reference: (${existingProductId.productReference}) has been authentified successfully.\n
      All details:
      ***********
      Product name: (${existingProductId.productName})
      Product reference: (${existingProductId.productReference})
      Manufacturer: (${existingProductId.manufacturer})
      Made in: (${existingProductId.madeIn})
      Year of release: (${existingProductId.yearOfRelease})

      Regards,
      ProAuth Mobile App`;
     
      const mailOptions = {
        from: EMAIL_SENDER,
        to: user.email,
        subject: 'ProAuth - Mobile App',
        text: textToBeSendOnMail
      };
      await transporter.sendMail(mailOptions);
    });

      res.status(200).send(requestLog);
    }else{
      const requestLog = new RequestLog({
        ...req.body,
        productIdExists: productIdExists_V,
        productRefExists: productRefExists_V,
        productUidExists: productUidExists_V,
        result: 'FAILED',
        createdAt: new Date()
      });
  
      await requestLog.save();

      //Send mail
    //const userToNotify = await UserMobile.find({ notifiedbymail: true });
    
    // Send email notifications
    userToNotify.forEach(async (user) => {
      console.log(`User: ${user.firstname}`);
      console.log(`User_email: ${user.email}`);
      textToBeSendOnMail = `Hello ${user.firstname},\n\nA product with id: (${productId}) having reference: (${productReference}) is not recognized as certified.\n\nRegards,\nProAuth Mobile App`;
     
      const mailOptions = {
        from: EMAIL_SENDER,
        to: user.email,
        subject: 'ProAuth - Mobile App',
        text: textToBeSendOnMail
      };
      await transporter.sendMail(mailOptions);
    });

      res.status(200).send(requestLog);
    }

  } catch (error) {
    res.status(500).send('Failed: Technical issues');
  }
});

// Capture Logged in user - Mobile
app.post('/logged-user', async (req, res) => {
  try {
    
    const loggedUser = new VisitLog({
      ...req.body,
      loggedInAt: new Date()
    });

    await loggedUser.save();
    res.status(201).send('Logged User captured');
  } catch (error) {
    res.status(500).send('Server error');
  }
});
// Total Logged in user - Mobile
app.get('/total-all-visit', async (req, res) => {
  try {
    const totalCount = await VisitLog.countDocuments();
    res.json({ totalAllVisit: totalCount });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Total Unique Logged in user - Mobile
app.get('/total-unique-visit', async (req, res) => {
  try {
    const uniqueCount = await VisitLog.aggregate([
      {
        $group: {
          _id: '$username',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalUniqueVisit: { $sum: 1 }
        }
      }
    ]);

    res.json({ totalUniqueVisit: uniqueCount[0].totalUniqueVisit });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Count requests per last 7 days
app.get('/request-per-day', async (req, res) => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  //sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // Date 7 days ago
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // Date 7 days ago

  try {
    const countsPerDay = await RequestLog.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo, $lte: today } // Filter records from the last 7 days
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, // Group by day
            result: '$result' // Group by result
          },
          count: { $sum: 1 } // Count records for each day and result
        }
      },
      {
        $group: {
          _id: '$_id.date',
          counts: {
            $push: {
              result: '$_id.result',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { _id: 1 } // Sort by date
      }
    ]);

    const dateMap = {};
    const formattedCounts = countsPerDay.map((dayCounts) => {
      const dateCounts = { date: dayCounts._id };
      dayCounts.counts.forEach(({ result, count }) => {
        dateCounts[result.toLowerCase()] = count;
      });
      dateCounts['total'] = dayCounts.counts.reduce((total, count) => total + count.count, 0);
      return dateCounts;
    });

    // Fill in missing days with count 0 for SUCCESS, FAILED, and total requests
    const dates = [];
    for (let i = sevenDaysAgo; i <= today; i.setDate(i.getDate() + 1)) {
      const dateKey = i.toISOString().slice(0, 10);
      const found = formattedCounts.find((item) => item.date === dateKey);
      if (found) {
        dates.push(found);
      } else {
        dates.push({ date: dateKey, success: 0, failed: 0, total: 0 });
      }
    }

    // Add this code to update the failed count to 0 if it's missing
    dates.forEach((item) => {
      if (!item.failed) {
        item.failed = 0;
      }
    });

    res.json(dates);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Count Requests from last hour
app.get('/request-last-hour', async (req, res) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // Calculate the timestamp for 1 hour ago

  try {
    const count = await RequestLog.countDocuments({
      createdAt: { $gte: oneHourAgo } // Filter documents with createdAt greater than or equal to 1 hour ago
    });

    res.json({ countFromLastHour: count });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
    console.log(`**********************************************`);
    console.log(`ProAuth Restful API - is running on port ${port}`);
    console.log(`**********************************************`);
});