const Bootcamp = require("../models/Bootcamp");

// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();

    res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps })
  } catch (err) {
    res.status(400).json({ success: false });
  }

  // res.status(200).send({ success: true, msg: "Show all bootcamps" });
};

// @desc     Get a bootcamp
// @route    GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = async (req, res, next) => {
  try { 
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc     Create a new bootcamp
// @route    POST /api/v1/bootcamps
// @access   Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data: bootcamp,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc     Update a bootcamp
// @route    PUT /api/v1/bootcamps/:id
// @access   Public
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      // if we get a response, we want the updated one 
      new: true,
      // run mongoose validator on an update
      runValidators: true
    });
  
    if (!bootcamp) {
      return res.status(400).json({ success: false });
    }
  
    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (err) {
    return res.status(400).json({ success: false });
  }
};

// @desc     Delete a bootcamp
// @route    DELETE /api/v1/bootcamps/:id
// @access   Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  
    if (!bootcamp) {
      return res.status(400).json({ success: false });
    }
  
    res.status(204).json({
      success: true,
      data: {}
    });
  } catch (err) {
    return res.status(400).json({ success: false });
  }
};
