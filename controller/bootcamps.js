const path = require("path");

const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewear/async");

const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");

// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // try {
  //   const bootcamps = await Bootcamp.find();

  //   res
  //     .status(200)
  //     .json({ success: true, count: bootcamps.length, data: bootcamps });
  // } catch (err) {
  //   // res.status(400).json({ success: false });
  //   next(err);
  // }
  let query;

  // Copy req.query
  let reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from the reqQeury
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create an operator ($lte, $gt)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    // select is a mongoose function, accepts spaces separated params eg: "name age"
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // console.log(req.query);
  // query collections using request parameters
  // const bootcamps = await Bootcamp.find(req.query);

  // Execute query
  const bootcamps = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination: pagination,
    data: bootcamps,
  });
});

// @desc     Get a bootcamp
// @route    GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(`Resource not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc     Create a new bootcamp
// @route    POST /api/v1/bootcamps
// @access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc     Update a bootcamp
// @route    PUT /api/v1/bootcamps/:id
// @access   Public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    // if we get a response, we want the updated one
    new: true,
    // run mongoose validator on an update
    runValidators: true,
  });

  if (!bootcamp) {
    return res.status(400).json({ success: false });
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc     Delete a bootcamp
// @route    DELETE /api/v1/bootcamps/:id
// @access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return res.status(400).json({ success: false });
  }

  bootcamp.remove();

  res.status(204).json({
    success: true,
    data: {},
  });
});

// @desc     Get bootcamps within a radius
// @route    DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access   Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get long/lat from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate the radius
  // Divide distance by radius of earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 6378;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc     Upload an image for a bootcamp
// @route    PUT /api/v1/bootcamps/:id/photo
// @access   Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the file is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Uploaded file is not an image`, 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Upload image less than${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log("Error:", err);
      return next(new ErrorResponse(`Issue with file upload}`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: file.name,
    });
  });

  res.status(203).json({
    success: true,
    data: file.name,
  });
});
