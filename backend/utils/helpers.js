const bcrypt = require('bcrypt');
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
    const data = jwt.verify(accessToken, JWT_SECRET);
    return data;
  } catch (error) {
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
