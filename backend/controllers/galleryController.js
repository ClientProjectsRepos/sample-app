const express = require("express");
const router = express.Router();
const Membership = require("../models/Membership");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.UploadImage = async (req, res) => {
  
};