var http = require("http");

const url = require("url");
const qs = require("querystring");

const { v4: uuidv4 } = require("uuid");

//create a server object:
http
  .createServer(function(req, res) {
    try {
      const isGuidRoute = req.url.startsWith("/guid");
      if (isGuidRoute) {
        httpGetGuid(req, res);
      } else {
        res.write(JSON.stringify(DOCUMENTATION, null, 2)); //write a response to the client
      }
    } catch (err) {
      console.log("caught");
      console.log(err);
      res.writeHead(400, null, { "Content-Type": "application/json" });
      res.write(
        JSON.stringify({
          message: `invalid http param. message=${err.message}`
        })
      );
    }

    res.end();
  })
  .listen(8080); //the server object listens on port 8080

function httpGetGuid(req, res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://angular-guidgenerator.stackblitz.io"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  console.log("cors headers sent");

  const current_url = new URL(`https://localhost${req.url}`);

  const amount = parseInt(current_url.searchParams.get("amount"), 10);
  const isUppercase = "true" === current_url.searchParams.get("isUppercase");
  const hasBraces = "true" === current_url.searchParams.get("hasBraces");
  const removeHyphens = "false" === current_url.searchParams.get("hasHyphens");
  const b64Encode = "true" === current_url.searchParams.get("b64Encode");
  const rfc7515 = "true" === current_url.searchParams.get("rfc7515");
  const urlEncode = "true" === current_url.searchParams.get("urlEncode");

  let payload = null;

  const ids = [];

  if (!amount) {
    throw Error("amount is NaN");
  }

  if (amount && (amount < 1 || amount > 2000)) {
    payload = {
      message: "`amount` must be between 1 and 2000, inclusive."
    };
  } else {
    for (let i = 0; i < amount; i++) {
      let uuid = uuidv4();

      if (isUppercase) {
        console.log("isUppercase");
        uuid = uuid.toUpperCase();
      }
      if (hasBraces) {
        console.log("hasBraces");
        uuid = `{${uuid}}`;
      }
      if (removeHyphens) {
        console.log("removeHyphens");
        uuid = uuid
          .replace("-", "")
          .replace("-", "")
          .replace("-", "")
          .replace("-", "");
      }
      if (b64Encode) {
        console.log("b64encode");
        const buffer = Buffer.from(uuid, "utf8");
        uuid = buffer.toString("base64");
      }
      if (rfc7515) {
        console.log("rfc7515");
        uuid = base64urlencode(uuid);
      }
      if (urlEncode) {
        console.log("urlEncode");
        uuid = qs.escape(uuid);
      }

      ids.push(uuid);
    }
  }

  if (!payload) {
    payload = {
      uuids: ids,
      amount: amount
    };
  }

  res.write(JSON.stringify(payload));
}

function base64urlencode(arg) {
  let s = arg.split("="); // Remove any trailing '='s
  s = s.replace(/+/, "-"); // 62nd char of encoding
  s = s.replace(/\//, "_"); // 63rd char of encoding
  return s;
}

// function base64urldecode(arg)
// {
//   string s = arg;
//   s = s.Replace('-', '+'); // 62nd char of encoding
//   s = s.Replace('_', '/'); // 63rd char of encoding
//   switch (s.Length % 4) // Pad with trailing '='s
//   {
//     case 0: break; // No pad chars in this case
//     case 2: s += "=="; break; // Two pad chars
//     case 3: s += "="; break; // One pad char
//     default: throw new System.Exception(
//       "Illegal base64url string!");
//   }
//   return Convert.FromBase64String(s); // Standard base64 decoder
// }

const DOCUMENTATION = [
  {
    route: "/guid",
    method: "GET",
    description: "Generate one or more GUIDs/UUIDs with formatting options.",
    queryParameters: {
      amount: {
        type: "number",
        desc: "Number of UUID's to generate.",
        required: true
      },
      isUppercase: {
        type: "boolean",
        desc: "Use all uppercase characters.",
        required: false,
        default: false
      },
      hasBraces: {
        type: "boolean",
        desc: "Enclose each UUID in curly braces, { and }",
        required: false,
        default: false
      },
      hasHyphens: {
        type: "boolean",
        desc: "Include hyphens (-) to segment each UUID.",
        required: false,
        default: true
      },
      b64Encode: {
        type: "boolean",
        desc: "Return the UUID as a base64 encoded string.",
        required: false,
        default: false
      },
      urlEncode: {
        type: "boolean",
        desc: "Return the UUID as a value safe for URL's.",
        required: false,
        default: false
      }
    }
  }
];
