const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewear/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

// @desc     Get all courses and courses offered by a Bootcamp
// @route    GET /api/v1/courses
// @route    GET /api/v1/bootcamps/:bootcampId/courses
// @access   Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: "bootcamp",
      select: "name description",
    });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// @desc     Get single course
// @route    GET /api/v1/courses/:id
// @access   Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc     Create a course
// @route    POST /api/v1/bootcamps/:bootcampId/courses
// @access   Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`),
      404
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc     Edit a course
// @route    PUT /api/v1/courses/:id
// @access   Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No Course with id of ${req.params.id}`),
      404
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc     Delete a course
// @route    DELETE /api/v1/courses/:id
// @access   Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No Course with id of ${req.params.id}`),
      404
    );
  }
});

