/**
 * Packages controllers
 * @author Shuja Naqvi
 */

const Package = require('../models/packages');

/**
 * Create New  Package
 * @param {object} req
 * @param {object} res
 */

exports.create = async (req, res) => {
  try {
    if (Object.keys(req.files).length > 0) {
      req.body.photo = req.files.image[0].path;
    }

    Package.create(req.body).then(interview => {
      res.status(200).json({ success: true, message: 'Package has been created', interview });
    });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * get all packages
 * @param {object} req
 * @param {object} res
 */

exports.getAll = async (req, res) => {
  try {
    const packages = await Package.find();
    return res.status(200).json({ data: { packages } });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * get by id
 * @param {object} req
 * @param {object} res
 */

exports.getById = async (req, res) => {
  try {
    const { packageId } = req.params;
    const package = await Package.findById(packageId);
    res.status(200).json({ success: true, package });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * update package
 * @param {object} req
 * @param {object} res
 */

exports.update = async (req, res) => {
  try {
    if (Object.keys(req.files).length > 0) {
      req.body.photo = req.files.image[0].path;
    }
    const { packageId } = req.params;
    const package = await Package.findByIdAndUpdate(packageId, req.body, { new: true });
    res.status(200).json({ success: true, package });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
