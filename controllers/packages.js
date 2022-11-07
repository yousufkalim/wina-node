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
    if (Object.keys(req.files).length < 1) {
      return res.status(404).json({ success: false, message: 'Picture required' });
    }
    req.body.photo = req.files.image[0].path;
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
    console.log(req.query, 'req.query');
    const { page, pageSize } = req.query;
    const pageNumber = page * 1 || 1;
    const pagesize = pageSize * 1 || 100;
    const skip = (pageNumber - 1) * pagesize;
    const packages = await Package.find().skip(skip).limit(pagesize);
    const packageLength = await Package.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);
    return res.status(200).json({ count: packageLength[0].count, data: { packages } });
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
