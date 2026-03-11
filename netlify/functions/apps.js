const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const archiver = require('archiver');
const stream = require('stream');
const cloudinary = require('cloudinary').v2;

// Firebase Init
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Cloudinary Init
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// ANDROID APP TEMPLATE
const generateAndroidApp = (school) => {
  const appId = `com.edumanagerpro.${school.subdomain}`;

  return `
package ${appId};

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);

        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("https://${school.subdomain}.edumanagerpro.com");
    }
}
`;
};


// IOS TEMPLATE
const generateiOSApp = (school) => {
  return `
import UIKit
import WebKit

class ViewController: UIViewController {

    var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        webView = WKWebView()
        view = webView

        let url = URL(string: "https://${school.subdomain}.edumanagerpro.com")!
        webView.load(URLRequest(url: url))
    }
}
`;
};


// CREATE ZIP FILE
const createZip = async (content, fileName) => {

  const bufferStream = new stream.PassThrough();
  const archive = archiver('zip');

  archive.append(content, { name: 'app.txt' });
  archive.finalize();

  archive.pipe(bufferStream);

  const chunks = [];

  return new Promise((resolve, reject) => {

    bufferStream.on('data', (chunk) => chunks.push(chunk));

    bufferStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    archive.on('error', reject);

  });
};


// UPLOAD TO CLOUDINARY
const uploadZip = async (buffer, fileName) => {

  return new Promise((resolve, reject) => {

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "school-apps",
        public_id: fileName
      },
      (error, result) => {

        if (error) reject(error);
        else resolve(result);

      }
    );

    uploadStream.end(buffer);

  });
};


exports.handler = async (event) => {

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {

    const token = event.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const path = event.path.replace('/.netlify/functions/apps/', '');



    // GENERATE APP
    if (path === 'generate' && event.httpMethod === 'POST') {

      const { schoolId, platform } = JSON.parse(event.body);

      if (decoded.schoolId !== schoolId) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
      }

      const schoolDoc = await db.collection('schools').doc(schoolId).get();

      if (!schoolDoc.exists) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'School not found' }) };
      }

      const school = schoolDoc.data();

      let content;
      let fileName;

      if (platform === 'android') {

        content = generateAndroidApp(school);
        fileName = `${school.subdomain}-android`;

      } else if (platform === 'ios') {

        content = generateiOSApp(school);
        fileName = `${school.subdomain}-ios`;

      } else {

        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid platform' }) };

      }


      // CREATE ZIP
      const zipBuffer = await createZip(content, fileName);


      // UPLOAD CLOUDINARY
      const upload = await uploadZip(zipBuffer, fileName);


      // SAVE BUILD RECORD
      const buildRef = await db.collection('appBuilds').add({
        schoolId,
        platform,
        status: 'completed',
        fileName: `${fileName}.zip`,
        downloadUrl: upload.secure_url,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });


      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          buildId: buildRef.id,
          downloadUrl: upload.secure_url,
        }),
      };

    }



    // GET BUILD STATUS
    if (path.startsWith('status/') && event.httpMethod === 'GET') {

      const buildId = path.split('/')[1];

      const buildDoc = await db.collection('appBuilds').doc(buildId).get();

      if (!buildDoc.exists) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Build not found' }) };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(buildDoc.data()),
      };

    }



    // DOWNLOAD
    if (path.startsWith('download/') && event.httpMethod === 'GET') {

      const buildId = path.split('/')[1];

      const buildDoc = await db.collection('appBuilds').doc(buildId).get();

      if (!buildDoc.exists) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Build not found' }) };
      }

      const build = buildDoc.data();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          downloadUrl: build.downloadUrl
        }),
      };

    }



    return { statusCode: 404, headers };

  } catch (error) {

    console.error('Apps function error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
    };

  }
};
