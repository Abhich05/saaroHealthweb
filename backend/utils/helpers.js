const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  SALT_ROUNDS,
  JWT_SECRET,
} = require('../config/config');

const Patient = require('../models/patient');
const Invoice = require('../models/invoice');

const getHashedPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, parseInt(SALT_ROUNDS));
  return hashedPassword;
}

const comparePassword = async (password, hashedPassword) => {
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  return isPasswordValid;
}

const getAccessToken = (data) => {
  const accessToken = jwt.sign(
    { data },
    JWT_SECRET,
    // { expiresIn: '48h' },
  );
  return accessToken;
}

const verifyAccessToken = async (accessToken) => {
  try {
    console.log('=== VERIFY ACCESS TOKEN DEBUG ===');
    console.log('Token to verify:', accessToken ? 'Present' : 'Missing');
    console.log('JWT_SECRET:', JWT_SECRET ? 'Present' : 'Missing');
    
    if (!accessToken) {
      console.log('No access token provided');
      return {
        error: { name: 'JsonWebTokenError', message: 'jwt must be provided' }
      };
    }
    
    const data = jwt.verify(accessToken, JWT_SECRET);
    console.log('Token verified successfully');
    return data;
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return {
      error: error,
    };
  }
}

const generatePatientUid = async () => {
  try {
    let uid;

    const existingPatients = await Patient.find();
    const existingUids = existingPatients.map((patient) => patient.uid);

    for (let i=1; i<100001; i++) {
      uid = `UID${i}`;
      if (!existingUids.includes(uid)) {
        break;
      }
    }

    return uid;
  } catch (error) {
    return {
      error: "Error generating UID",
    };
  }
};

const generateInvoiceId = async () => {
  try {
    let invoiceId;

    const existingInvoices = await Invoice.find();
    const existingInvoiceIds = existingInvoices.map((invoice) => invoice.invoiceId);

    for (let i=1; i<100001; i++) {
      invoiceId = `INVC${i}`;
      if (!existingInvoiceIds.includes(invoiceId)) {
        break;
      }
    }

    return invoiceId;
  } catch (error) {
    return {
      error: "Error generating UID",
    };
  }
};

module.exports = {
  getHashedPassword,
  comparePassword,
  getAccessToken,
  verifyAccessToken,
  generatePatientUid,
  generateInvoiceId,
};
