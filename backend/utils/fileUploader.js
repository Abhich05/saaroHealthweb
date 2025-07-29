const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');
const multer = require('multer');

const Patient = require('../models/patient');
const FileUploader = require('../models/fileUploader');
const DoctorPatient = require('../models/doctorPatient');

const fileUploader = (req, res) => {
  try {
    console.log('Incoming upload request:', {
      params: req.params,
      body: req.body,
      query: req.query,
      headers: req.headers,
    });
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const folder = 'public/health&ipd/';
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        const fileExtension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}_${file.fieldname}${fileExtension}`);
      },
    });

    const fileFilter = (req, file, cb) => {
      const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg'];
      const fileExtension = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed.'), false);
      }
    };

    const upload = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }).single('file');

    upload(req, res, (err) => {
      console.log('Upload callback:', {
        file: req.file,
        body: req.body,
        params: req.params,
      });
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Multer error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: `Error: ${err.message}` });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      const fileUploader = new FileUploader({
        fileUrl: `${process.env.SERVER_URL}/public/health&ipd/${req.file.filename}`,
        patientId: req.params.patientId,
        type: req.body.fileType,
        admissionDate: req.body.admissionDate,
        dischargeDate: req.body.dischargeDate,
        status: req.body.status,
        doctorId: req.body.doctorId,
      });
      fileUploader.save().then(saved => {
        console.log('DEBUG: Saved IPD record:', saved);
      });

      return res.status(200).json({
        message: 'File uploaded successfully.',
        file: req.file.filename,
        type: req.body.fileType,
        patientId: req.params.patientId,
        fileUrl: `${process.env.SERVER_URL}/public/health&ipd/${req.file.filename}`,
      });
    });
  } catch (error) {
    console.error('Unexpected error in fileUploader:', error);
    res.status(500).json({
      message: `An error occurred: ${error}`,
    });
  }
}

const uploadPatientRecords = (req, res) => {
  try {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const folder = 'public/patient-record/';
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        const fileExtension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}_${file.fieldname}${fileExtension}`);
      },
    });

    const fileFilter = (req, file, cb) => {
      const allowedTypes = ['.xlsx'];
      const fileExtension = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only XLSX are allowed.'), false);
      }
    };

    const upload = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }).single('file');

    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Multer error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: `Error: ${err.message}` });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = xlsx.utils.sheet_to_json(sheet);

      let duplicateCount = 0;
      const doctorId = '67557862cddece23fd10d968';
      const allPatients = [];
      const allDoctorPatients = [];
      const duplicatePhoneNumbers = [];
      
      const patients = await Patient.find();
      const patientPhoneNumbers = patients.map((patient) => patient.phoneNumber);

      for (const [index, data] of jsonData.entries()) {
        try {
          const phone = data['Mob. No.'];
          const name = data['Patient Name'];
          const address = data['Address'];
          const city = data['City'];
          const state = data['State'];
          const ageSex = data['AgeSex'];

          if (phone === undefined || phone === null || phone === '') {
            continue;
          }

          const { age, sex } = parseAgeSex(ageSex);
          if (!patientPhoneNumbers.includes(phone)) {
            patientPhoneNumbers.push(phone);
            const newPatient = new Patient({
              uid: `UID${allPatients.length + 1285}`,
              fullName: name,
              phoneNumber: parseInt(phone),
              address: address
                ? `${address}, ${city}, ${state}`
                : `${city}, ${state}`,
              age,
              gender: sex,
            });

            allPatients.push(newPatient);

            allDoctorPatients.push(new DoctorPatient({
              doctorId,
              patientId: newPatient._id,
            }));
          } else {
            duplicateCount++;
            if (!duplicatePhoneNumbers.includes(phone)) {
              duplicatePhoneNumbers.push(phone);
            }
          }
        } catch (error) {
          console.error(`Error processing row ${index + 1}:`, error.message);
        }
      }

      await Patient.insertMany(allPatients);
      await DoctorPatient.insertMany(allDoctorPatients);

      console.log('Total New Patients Count: ', allPatients.length, ' ', allDoctorPatients.length);
      console.log('Total duplicate counts: ', duplicateCount, duplicatePhoneNumbers.length);

      fs.unlinkSync(filePath);

      return res.status(200).json({
        message: 'File uploaded and processed successfully!',
        data: allPatients,
        doctorPatient: allDoctorPatients,
        duplicates: duplicatePhoneNumbers,
      });
    });
  } catch (error) {
    res.status(500).json({
      message: `An error occurred: ${error.message}`,
    });
  }
};

function parseAgeSex(ageSex) {
  const match = ageSex.match(/(\d+)\s*Y\s*\/\s*([MF])/i);

  if (!match) {
    return { age: null, sex: "Other" };
  }

  const age = parseInt(match[1], 10);
  const sex = match[2].toUpperCase() === "M" ? "Male" : match[2].toUpperCase() === "F" ? "Female" : "Other";

  return { age, sex };
}

module.exports = {
  fileUploader,
  uploadPatientRecords,
};
