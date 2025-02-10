var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Backend/server.js
var server_exports = {};
__export(server_exports, {
  app: () => app,
  closeServer: () => closeServer,
  httpResponses: () => httpResponses,
  tokens: () => tokens
});
module.exports = __toCommonJS(server_exports);

// Backend/SqlTestCode.js
var import_promise = __toESM(require("mysql2/promise"));
var settings = {
  host: "10.16.0.5",
  user: "root",
  password: "m49C*CG^KMX%G*",
  database: "SystemData"
};
async function open() {
  try {
    const connection = await import_promise.default.createConnection(settings);
    return connection;
  } catch (err) {
    console.error("Error: " + err.stack);
    throw err;
  }
}
async function close(connection) {
  try {
    await connection.end();
  } catch (err) {
    console.error("Error: " + err.stack);
  }
}
async function sqlInsert(tablename, parameters, values) {
  const connection = await open();
  try {
    const sql = `INSERT INTO ${tablename} (${parameters.join(", ")})
    VALUES (${values.map(() => "?").join(", ")})`;
    await connection.execute(sql, values);
  } catch (err) {
    console.error("Error: " + err.stack);
  } finally {
    await close(connection);
  }
}
async function sqlUpdate(tablename, parameters, values, condition) {
  const connection = await open();
  try {
    const operator = parameters.map((param) => `${param} = ?`).join(", ");
    const sql = `UPDATE ${tablename} SET ${operator} WHERE ${condition}`;
    await connection.execute(sql, values);
  } catch (err) {
    console.error("Error: " + err.stack);
  } finally {
    await close(connection);
  }
}
async function sqlDelete(tablename, condition) {
  const connection = await open();
  try {
    const sql = `DELETE FROM ${tablename} WHERE ${condition}`;
    await connection.execute(sql);
  } catch (err) {
    console.error("Error: " + err.stack);
  } finally {
    await close(connection);
  }
}
async function sqlSelect(tablename, condition) {
  const connection = await open();
  try {
    const sql = `SELECT * FROM ${tablename} WHERE ${condition}`;
    const [results] = await connection.execute(sql);
    return results;
  } catch (err) {
    console.error("Error running query: " + err.stack);
    return null;
  } finally {
    await close(connection);
  }
}
async function sqlSelectAll(tablename) {
  const connection = await open();
  try {
    const sql = `SELECT * FROM ${tablename}`;
    const [results] = await connection.execute(sql);
    return results;
  } catch (err) {
    console.error("Error running query: " + err.stack);
    return null;
  } finally {
    await close(connection);
  }
}

// Backend/helper.js
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_bcrypt = __toESM(require("bcrypt"));
var secretKey = "3900F18BPookie";
function generateToken() {
  const expirationTime = Math.floor(Date.now() / 1e3) + 60 * 60;
  const payload = {
    currentTime: (/* @__PURE__ */ new Date()).toISOString(),
    expiryTime: expirationTime
  };
  return import_jsonwebtoken.default.sign(payload, secretKey);
}
async function generateHash(input) {
  const saltRounds = 10;
  const hash = await import_bcrypt.default.hash(input, saltRounds);
  return hash.toString();
}
function generateVerificationCode() {
  const code = Math.floor(1e5 + Math.random() * 9e5);
  const currentTime = /* @__PURE__ */ new Date();
  const expiryTime = new Date(currentTime.getTime() + 10 * 6e4);
  return {
    code,
    expiryTime
  };
}
function isUNSWEmail(email) {
  email = email.trim();
  if (email.includes(" ")) {
    return false;
  }
  const validCharsRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+$/;
  if (!validCharsRegex.test(email)) {
    return false;
  }
  const validDomains = [
    "@unsw.edu.au",
    "@ad.student.unsw.edu.au",
    "@student.unsw.edu.au",
    "@ad.unsw.edu.au"
  ];
  return validDomains.some((domain) => email.endsWith(domain));
}
function isImageUrl(url) {
  if (typeof url !== "string") {
    return false;
  }
  const imagePattern = /\.(jpeg|jpg|gif|png|webp|bmp|svg|tiff|tif)$/i;
  try {
    new URL(url);
  } catch {
    return false;
  }
  return imagePattern.test(url);
}

// Backend/mailHelpers.js
var import_nodemailer = __toESM(require("nodemailer"));
async function sendEmail(email, subject, body, attachmentPath = "") {
  try {
    const transporter = import_nodemailer.default.createTransport({
      service: "gmail",
      auth: {
        user: "comppookie@gmail.com",
        // email address
        pass: "xuwy zgsx bdsl bldu"
        // Gmail app-specific password
      }
    });
    const attachments = [];
    if (attachmentPath) {
      attachments.push({ path: attachmentPath });
    }
    const mailOptions = {
      from: "comppookie@gmail.com",
      to: email,
      subject,
      text: body,
      attachments
    };
    await transporter.sendMail(mailOptions);
    return;
  } catch (error) {
    return error.message;
  }
}

// Backend/auth.js
var import_bcrypt2 = __toESM(require("bcrypt"));
async function authUserLogin(username, password) {
  const tableName = "Users";
  const condition = `Email="${username}"`;
  try {
    const dbResponse = await sqlSelect(tableName, condition);
    if (dbResponse.length === 0) {
      throw new Error("The user does not exist");
    }
    const passwordMatches = await import_bcrypt2.default.compare(
      password,
      dbResponse[0].Password
    );
    if (passwordMatches) {
      if (dbResponse[0].AcountStatus === "unverified") {
        throw new Error("unverified account");
      }
      if (dbResponse[0].AcountStatus === "terminated") {
        throw new Error("terminated account");
      }
      if (tokens.exists(username)) {
        tokens.remove(tokens.getToken(username));
      }
      const token = generateToken();
      await tokens.add(username, token);
      return token;
    } else {
      throw new Error("Password does not match");
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
async function authUserCreate(User) {
  const username = User.email;
  const tablename = "Users";
  const condition = `Email="${username}"`;
  try {
    const dbResponse = await sqlSelect(tablename, condition);
    if (dbResponse.length !== 0) {
      throw new Error("User already exists in the database.");
    }
    if (!isUNSWEmail(username)) {
      throw new Error("Email must be a UNSW email.");
    }
    const parameters = [
      "Email",
      "FirstName",
      "LastName",
      "Password",
      "Role",
      "AcountStatus",
      "VerificationCode",
      "CodeExpiry",
      "Notes"
    ];
    const role = User.role || "N/A";
    const hash = await generateHash(User.password);
    const values = [
      username,
      User.firstName,
      User.lastName,
      hash,
      role,
      "unverified",
      null,
      null,
      null
    ];
    await sqlInsert(tablename, parameters, values);
    return;
  } catch (error) {
    throw new Error(error.message);
  }
}
async function sendCode(username) {
  const tablename = "Users";
  const condition = `Email="${username}"`;
  const dbResponse = await sqlSelect(tablename, condition);
  if (dbResponse.length === 0) {
    throw new Error("The user does not exist");
  }
  const code = generateVerificationCode();
  const parameters = ["VerificationCode", "CodeExpiry"];
  const values = [code.code, code.expiryTime];
  try {
    await sqlUpdate(tablename, parameters, values, condition);
    const emailBody = `Your verification code is: ${code.code}.

      This code will expire at: ${code.expiryTime}.`;
    const emailSubject = "Verification Code";
    await sendEmail(username, emailSubject, emailBody);
    return;
  } catch (error) {
    throw new Error(error.message);
  }
}
async function verifyCode(username, code) {
  const tablename = "Users";
  const condition = `Email="${username}"`;
  const dbResponse = await sqlSelect(tablename, condition);
  if (dbResponse.length === 0) {
    throw new Error("The user does not exist");
  }
  if (dbResponse[0].AcountStatus === "verified") {
    throw new Error("The user is already verified");
  }
  if (dbResponse[0].AcountStatus === "terminated") {
    throw new Error("terminated account");
  }
  if (dbResponse[0].VerificationCode === code) {
    const currentTime = /* @__PURE__ */ new Date();
    const expiryTime = new Date(dbResponse[0].CodeExpiry);
    if (currentTime > expiryTime) {
      throw new Error("The code has expired");
    }
    const parameters = ["AcountStatus", "VerificationCode", "CodeExpiry"];
    const values = ["verified", null, null];
    try {
      await sqlUpdate(tablename, parameters, values, condition);
      return;
    } catch (error) {
      throw new Error(error.message);
    }
  } else {
    throw new Error("The code does not match");
  }
}
async function authUserDelete(username, token) {
  if (!tokens.existsByToken(token)) {
    throw new Error("Invalid token");
  }
  const tablename = "Users";
  const condition = `Email="${username}"`;
  const dbResponse = await sqlSelect(tablename, condition);
  const user = tokens.getUser(token);
  const dbResponseUser = await sqlSelect(tablename, `Email="${user}"`);
  if (dbResponseUser[0].Role !== "Admin") {
    throw new Error("Admin access required for this operation");
  }
  if (dbResponse.length === 0) {
    throw new Error("The user does not exist");
  }
  try {
    await sqlDelete(tablename, condition);
    return;
  } catch (error) {
    throw new Error(error.message);
  }
}
function authUserLogout(token) {
  if (tokens.existsByToken(token)) {
    tokens.remove(token);
    return;
  }
  throw new Error("Invalid token");
}
async function authUserGet(username = null, token) {
  if (!tokens.existsByToken(token)) {
    throw new Error("Invalid token");
  }
  const tablename = "Users";
  const user = tokens.getUser(token);
  const condition = `Email="${user}"`;
  const dbResponseUser = await sqlSelect(tablename, condition);
  if (username) {
    if (dbResponseUser[0].Role !== "Admin") {
      throw new Error("Admin access required for this operation");
    }
    const condition2 = `Email="${username}"`;
    const dbResponse = await sqlSelect(tablename, condition2);
    if (dbResponse.length === 0) {
      throw new Error("The user does not exist");
    }
    return {
      firstName: dbResponse[0].FirstName,
      lastName: dbResponse[0].LastName,
      email: dbResponse[0].Email,
      role: dbResponse[0].Role,
      accountStatus: dbResponse[0].AcountStatus,
      notes: dbResponse[0].Notes
    };
  } else {
    return {
      firstName: dbResponseUser[0].FirstName,
      lastName: dbResponseUser[0].LastName,
      email: dbResponseUser[0].Email,
      role: dbResponseUser[0].Role,
      accountStatus: dbResponseUser[0].AcountStatus,
      notes: dbResponseUser[0].Notes
    };
  }
}

// Backend/feedback.js
async function userFeedback(Feedback, Rating, token) {
  if (!tokens.existsByToken(token)) {
    throw new Error("Invalid token");
  }
  const tablename = "UserFeedback";
  const parameters = ["Feedback", "Rating"];
  const values = [Feedback, Rating];
  try {
    await sqlInsert(tablename, parameters, values);
    return;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Backend/helpForm.js
async function requestHelp(userEmail, textHelp, token) {
  if (!tokens.existsByToken(token)) {
    throw new Error("Invalid token");
  }
  const tablename = "HelpRequests";
  const parameters = ["userEmail", "textHelp"];
  const values = [userEmail, textHelp];
  try {
    await sqlInsert(tablename, parameters, values);
    return "Request for help was lodged successfully";
  } catch (error) {
    throw new Error(error.message);
  }
}
async function helpList(state, token) {
  if (!tokens.existsByToken(token)) {
    throw new Error("Invalid token");
  }
  try {
    const tablename = "HelpRequests";
    let helpRequests;
    if (state === "all") {
      helpRequests = await sqlSelectAll(tablename);
      return helpRequests;
    } else {
      helpRequests = await sqlSelect(tablename, `status="${state}"`);
      return helpRequests;
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

// Backend/spaces.js
async function searchSpaces(token, query, features) {
  if (!tokens.existsByToken(token)) {
    throw new Error("Invalid token");
  }
  if (!query || query.length > 200) {
    throw new Error("Invalid search query");
  }
  const validSortFields = ["Capacity", "Projector", "Whiteboard", "Desktops"];
  if (features && !validSortFields.includes(features)) {
    throw new Error("Invalid sort field");
  }
  try {
    const results = await sqlSelect("Spaces", `Name LIKE '%${query}%'
      OR Type LIKE '%${query}%'`);
    if (features) {
      results.sort((a, b) => b[features] - a[features]);
    }
    return results;
  } catch (error) {
    throw new Error(error.message);
  }
}
async function getSpaces(spaceID, token) {
  if (!tokens.existsByToken(token)) {
    throw new Error("Invalid token");
  }
  const dbResponse = await sqlSelect(
    "Users",
    `Email = '${tokens.getUser(token)}'`
  );
  if (dbResponse[0].AcountStatus !== "verified") {
    throw new Error("unverified account");
  }
  const tableName = "Spaces";
  const condition = `SpaceID = ${spaceID}`;
  try {
    const results = await sqlSelect(tableName, condition);
    if (results.length === 0) {
      throw new Error("Space not found");
    }
    return results[0];
  } catch (error) {
    throw new Error(error.message);
  }
}
async function createSpace(Name, Type, Capacity, Projector, Whiteboard, Desktops, Thumbnail, Description) {
  const tablename = "Spaces";
  const parameters = [
    "Name",
    "Type",
    "Capacity",
    "Projector",
    "Whiteboard",
    "Desktops",
    "Thumbnail",
    "Description"
  ];
  const values = [
    Name,
    Type,
    Capacity,
    Projector,
    Whiteboard,
    Desktops,
    Thumbnail,
    Description
  ];
  try {
    const result = await spaceExists(tablename, "Name", Name);
    if (result === true) {
      throw new Error(`Space with the name "${Name}" already exists.`);
    } else {
      await sqlInsert(tablename, parameters, values);
      return;
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
async function spaceExists(tablename, parameter, Name) {
  const condition = `${parameter}='${Name}'`;
  const result = await sqlSelect(tablename, condition);
  if (result.length > 0) {
    return true;
  } else {
    return false;
  }
}

// Backend/floorplans.js
async function listFloorplans(token) {
  if (!tokens.existsByToken(token)) {
    throw new Error("Invalid token");
  }
  try {
    const list = await sqlSelect("Floorplans", "true");
    const results = list.map((list2) => ({
      FloorplanID: list2.FloorplanID,
      Name: list2.Name
    }));
    return results;
  } catch (error) {
    throw new Error(error.message);
  }
}
async function getFloorplans(token, floorplanID) {
  if (!tokens.existsByToken(token)) {
    throw new Error("Invalid token");
  }
  try {
    const ID = parseInt(floorplanID, 10);
    if (!Number.isInteger(ID)) {
      throw new Error("Invalid floorplanID");
    }
    const condition = `FloorplanID="${floorplanID}"`;
    const results = await sqlSelect("Floorplans", condition);
    if (results.length === 0) {
      throw new Error("The floorplan does not exist");
    }
    return results;
  } catch (error) {
    throw new Error(error.message);
  }
}
async function floorplansCreate(data) {
  if (!tokens.existsByToken(data.token)) {
    throw new Error("Invalid token");
  }
  const Name = data.Name;
  const Image = data.Image;
  const Pins = data.Pins;
  try {
    if (!Name || Name.length > 50) {
      throw new Error("Invalid Name");
    }
    if (!Pins) {
      throw new Error("Pins cannot be empty");
    }
    if (!isImageUrl(Image)) {
      throw new Error("Image must be a valid url to an image");
    }
    const parameters = ["Name", "Image", "Pins"];
    const values = [Name, Image, Pins];
    await sqlInsert("Floorplans", parameters, values);
    return;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Backend/server.js
var import_express = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));

// Backend/createBooking.js
async function createBooking(userEmail, spaceId, startTime, endTime, notes) {
  const spaceType = await getSpaceType(spaceId);
  if (!spaceType) {
    throw new Error("Space not found");
  }
  const isAuthorized = await checkUserAuthorization(userEmail, spaceType);
  if (!isAuthorized) {
    throw new Error(
      `User is not authorized to book a ${spaceType.toLowerCase()}`
    );
  }
  const isAvailable = await checkSpaceAvailability(
    spaceId,
    startTime,
    endTime
  );
  if (!isAvailable) {
    throw new Error(
      `${spaceType} is not available for the selected time slot`
    );
  }
  await sqlInsert(
    "Bookings",
    ["SpaceID", "UserEmail", "StartTime", "EndTime", "Notes"],
    [spaceId, userEmail, startTime, endTime, notes]
  );
  return "Booking created successfully";
}
async function getSpaceType(spaceId) {
  const results = await sqlSelect("Spaces", `SpaceID = ${spaceId}`);
  if (results.length === 0) {
    return null;
  }
  return results[0].Type;
}
async function checkUserAuthorization(userEmail, spaceType) {
  const roleCondition = spaceType === "Room" ? "(Role = 'CSE Staff')" : "(Role = 'CSE Staff' OR Role = 'HDR')";
  const results = await sqlSelect(
    "Users",
    `Email = '${userEmail}' AND ${roleCondition}`
  );
  return results.length > 0;
}
async function checkSpaceAvailability(spaceId, startTime, endTime) {
  const results = await sqlSelect(
    "Bookings",
    `SpaceID = ${spaceId} AND StartTime < '${endTime}' AND EndTime > '${startTime}'`
  );
  return results.length === 0;
}

// Backend/availableSpacesFloorId.js
async function availableSpacesFloorId(floorplanID, startTime, endTime) {
  const spaces = await sqlSelect(
    "Spaces",
    `BuildingID = ${floorplanID}`
  );
  if (spaces.length === 0) {
    throw new Error("No spaces found for the given floorplanID");
  }
  const availableSpaces = [];
  for (const space of spaces) {
    const bookings = await sqlSelect(
      "Bookings",
      `SpaceID = ${space.SpaceID} AND StartTime < '${endTime}' AND EndTime > '${startTime}'`
    );
    if (bookings.length === 0) {
      availableSpaces.push(space);
    }
  }
  return availableSpaces;
}

// Backend/availableSpacesSpaceId.js
async function availableSpacesSpaceId(spaceId, startTime, endTime) {
  try {
    let start = new Date(startTime);
    const end = new Date(endTime);
    const slots = [];
    while (start < end) {
      const slotEnd = new Date(start.getTime() + 30 * 6e4);
      if (slotEnd <= end) {
        slots.push({ start: new Date(start), end: slotEnd });
      }
      start = slotEnd;
    }
    const bookings = await sqlSelect(
      "Bookings",
      `SpaceID = ${spaceId} AND ((StartTime < '${endTime}' AND EndTime > '${startTime}'))`
      // eslint-disable-line max-len
    );
    const availableSlots = slots.filter((slot) => {
      return !bookings.some((booking) => {
        const bookingStart = new Date(booking.StartTime);
        const bookingEnd = new Date(booking.EndTime);
        return slot.start < bookingEnd && slot.end > bookingStart;
      });
    });
    return availableSlots;
  } catch {
    throw new Error("Database error");
  }
}

// Backend/server.js
var app = (0, import_express.default)();
var port = 5e3;
app.use(import_express.default.json());
app.use(
  (0, import_cors.default)({
    origin: "*",
    // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
var Tokens = class {
  constructor() {
    this.tokens = [];
  }
  add(username, token) {
    this.tokens.push({
      user: username,
      token
    });
  }
  remove(tokenToRemove) {
    this.tokens = this.tokens.filter((tokenObj) => tokenObj.token !== tokenToRemove);
  }
  removeAll() {
    this.tokens = [];
  }
  exists(username) {
    return this.tokens.some((tokenObj) => tokenObj.user === username);
  }
  existsByToken(token) {
    return this.tokens.some((tokenObj) => {
      if (tokenObj.token === token) {
        try {
          const decoded = import_jsonwebtoken2.default.verify(token, secretKey);
          if (decoded.expiryTime && decoded.expiryTime < Date.now() / 1e3) {
            return false;
          }
          return true;
        } catch {
          return false;
        }
      }
      return false;
    });
  }
  getUser(token) {
    for (const tokenObj of this.tokens) {
      if (tokenObj.token === token) {
        return tokenObj.user;
      }
    }
    return null;
  }
  getToken(username) {
    for (const tokenObj of this.tokens) {
      if (tokenObj.user === username) {
        return tokenObj.token;
      }
    }
  }
};
var httpResponses = {
  "The user does not exist": 404,
  "The code does not match": 403,
  "The code has expired": 403,
  "The user is already verified": 409,
  "terminated account": 401,
  "unverified account": 401,
  "Email must be a UNSW email.": 403,
  "User already exists in the database.": 409,
  "Password does not match": 403,
  "Admin access required for this operation": 403,
  "Invalid token": 498,
  "Invalid search query": 400,
  "Invalid floorplanID": 400,
  "The floorplan does not exist": 404,
  "Space not found": 404,
  "Invalid Name": 400,
  "Pins cannot be empty": 400,
  "Image must be a valid url to an image": 400
};
var tokens = new Tokens();
app.post("/user/create", async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send("Bad request");
    return;
  }
  try {
    await authUserCreate(req.body);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  }
});
app.post("/user/verify", (req, res) => {
  const username = req.body.username;
  const verificationCode = req.body.verificationCode;
  if (!username || !verificationCode) {
    res.status(400).send("Bad request");
    return;
  }
  verifyCode(username, verificationCode).then(() => res.sendStatus(200)).catch((error) => {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  });
});
app.delete("/user/delete", (req, res) => {
  if (!req.query.username || !req.query.token) {
    res.status(400).send("Bad request");
    return;
  }
  authUserDelete(req.query.username, req.query.token).then(() => res.sendStatus(200)).catch((error) => {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  });
});
app.get("/user/get", (req, res) => {
  if (!req.query.token) {
    res.status(400).send("Bad request");
    return;
  }
  let username = null;
  if (req.query.username !== null) {
    username = req.query.username;
  }
  authUserGet(username, req.query.token).then((response) => res.status(200).send(response)).catch((error) => {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  });
});
app.post("/feedback/create", async (req, res) => {
  const { rating, feedback, token } = req.body;
  if (!rating || !feedback || !token) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    await userFeedback(feedback, rating, token);
    return res.status(200).json({ message: "Feedback received" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.post("/help/create", async (req, res) => {
  const { userEmail, textHelp, token } = req.body;
  if (!userEmail || !textHelp || !token) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    await requestHelp(userEmail, textHelp, token);
    return res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    return res.status(statusCode).send(error.message);
  }
});
app.get("/help/get", async (req, res) => {
  const { state, token } = req.query;
  const validStates = ["active", "closed", "all"];
  if (!validStates.includes(state) || !token) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    const result = await helpList(state, token);
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  }
});
app.get("/user/login", async (req, res) => {
  if (!req.query.username || !req.query.password) {
    res.status(400).send("Bad request");
    return;
  }
  const username = req.query.username;
  const password = req.query.password;
  try {
    const response = await authUserLogin(username, password);
    if (tokens.existsByToken(response)) {
      res.status(200).send(response);
    } else {
      res.sendStatus(500);
    }
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  }
});
app.get("/user/logout", (req, res) => {
  if (!req.query.token) {
    res.status(400).send("Bad request");
  }
  try {
    authUserLogout(req.query.token);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  }
});
app.get("/user/sendCode", async (req, res) => {
  if (!req.query.username || req.query.username.length === 0) {
    res.status(400).send("Bad request");
    return;
  }
  try {
    await sendCode(req.query.username);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  }
});
app.get("/spaces/search", (req, res) => {
  if (!req.query.token) {
    res.status(401).send("Unauthorized");
    return;
  }
  if (!req.query.keywords) {
    res.status(400).send("Bad request");
    return;
  }
  const keywords = req.query.keywords || null;
  const features = req.query.features || null;
  searchSpaces(req.query.token, keywords, features).then((response) => res.status(200).send(response)).catch((error) => {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  });
});
app.get("/spaces/get/:spaceID", (req, res) => {
  if (!req.query.token) {
    res.status(401).send("Unauthorized");
    return;
  }
  if (!req.params.spaceID) {
    res.status(400).send("Bad request");
    return;
  }
  getSpaces(req.params.spaceID, req.query.token).then((response) => res.status(200).send(response)).catch((error) => {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  });
});
app.post("/spaces/create", async (req, res) => {
  if (!req.body.token) {
    res.status(401).send("Unauthorized");
    return;
  }
  const {
    Name,
    Type,
    Capacity,
    Projector,
    Whiteboard,
    Desktops,
    Thumbnail,
    Description
  } = req.body;
  try {
    await createSpace(
      Name,
      Type,
      Capacity,
      Projector,
      Whiteboard,
      Desktops,
      Thumbnail,
      Description
    );
    res.status(200).send("Created Space");
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  }
});
app.get("/floorplan/list", (req, res) => {
  if (!req.query.token) {
    res.status(401).send("Unauthorized");
    return;
  }
  listFloorplans(req.query.token).then((response) => res.status(200).send(response)).catch((error) => {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  });
});
app.get("/floorplan/get", (req, res) => {
  if (!req.query.token) {
    res.status(401).send("Unauthorized");
    return;
  }
  let floorplanID = null;
  if (req.query.floorplanID !== null) {
    floorplanID = req.query.floorplanID;
  }
  getFloorplans(req.query.token, floorplanID).then((response) => res.status(200).send(response)).catch((error) => {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  });
});
app.post("/floorplan/create", async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send("Bad request");
    return;
  }
  if (!req.body.token) {
    res.status(401).send("Unauthorized");
    return;
  }
  try {
    await floorplansCreate(req.body);
    res.sendStatus(200);
  } catch (error) {
    const statusCode = httpResponses[error.message] || 500;
    res.status(statusCode).send(error.message);
  }
});
app.post("/Booking/create", async (req, res) => {
  const { userEmail, spaceId, startTime, endTime, notes } = req.body;
  try {
    await createBooking(userEmail, spaceId, startTime, endTime, notes);
    res.status(200).send("Booking created successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});
app.get("/bookings/availableSpaces/:floorplanID", async (req, res) => {
  const { floorplanID } = req.params;
  const { startTime, endTime } = req.query;
  try {
    const availableSpaces = await availableSpacesFloorId(
      floorplanID,
      startTime,
      endTime
    );
    res.status(200).json(availableSpaces);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});
app.get("/bookings/availableSpaces/:spaceID", async (req, res) => {
  const { spaceID } = req.params;
  const { startTime, endTime } = req.query;
  try {
    const availableSlots = await availableSpacesSpaceId(
      spaceID,
      startTime,
      endTime
    );
    res.status(200).json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
var server = app.listen(port, () => {
});
function closeServer() {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        console.error("Error while closing server:", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app,
  closeServer,
  httpResponses,
  tokens
});
