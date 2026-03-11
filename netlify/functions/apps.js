const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const archiver = require('archiver');
const stream = require('stream');

// Initialize Firebase Admin
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

// Generate Android app
const generateAndroidApp = async (school) => {
  const appId = `com.edumanagerpro.${school.subdomain}`;
  const appName = school.name.replace(/[^a-zA-Z0-9]/g, '');

  const appTemplate = `
    package ${appId};
    
    import android.os.Bundle;
    import android.webkit.WebSettings;
    import android.webkit.WebView;
    import android.webkit.WebViewClient;
    import androidx.appcompat.app.AppCompatActivity;
    
    public class MainActivity extends AppCompatActivity {
        private WebView webView;
        
        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.activity_main);
            
            webView = findViewById(R.id.webview);
            WebSettings webSettings = webView.getSettings();
            webSettings.setJavaScriptEnabled(true);
            
            webView.setWebViewClient(new WebViewClient());
            webView.loadUrl("https://${school.subdomain}.edumanagerpro.com");
        }
        
        @Override
        public void onBackPressed() {
            if (webView.canGoBack()) {
                webView.goBack();
            } else {
                super.onBackPressed();
            }
        }
    }
  `;

  return appTemplate;
};

// Generate iOS app
const generateiOSApp = async (school) => {

  const bundleId = `com.edumanagerpro.${school.subdomain}`;

  const appTemplate = `
    import UIKit
    import WebKit
    
    class ViewController: UIViewController, WKNavigationDelegate {
        var webView: WKWebView!
        
        override func viewDidLoad() {
            super.viewDidLoad()
            
            let webConfiguration = WKWebViewConfiguration()
            webView = WKWebView(frame: .zero, configuration: webConfiguration)
            webView.navigationDelegate = self
            view = webView
            
            let url = URL(string: "https://${school.subdomain}.edumanagerpro.com")!
            webView.load(URLRequest(url: url))
        }
    }
  `;

  return appTemplate;
};

exports.handler = async (event) => {

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {

    const token = event.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const path = event.path.replace('/.netlify/functions/apps/', '');

    // Generate app
    if (path === 'generate' && event.httpMethod === 'POST') {

      const { schoolId, platform } = JSON.parse(event.body);

      if (decoded.schoolId !== schoolId) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Forbidden' }),
        };
      }

      const schoolDoc = await db.collection('schools').doc(schoolId).get();

      if (!schoolDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'School not found' }),
        };
      }

      const school = schoolDoc.data();

      let appContent;
      let fileName;

      if (platform === 'android') {

        appContent = await generateAndroidApp(school);
        fileName = `${school.subdomain}-android.zip`;

      } else if (platform === 'ios') {

        appContent = await generateiOSApp(school);
        fileName = `${school.subdomain}-ios.zip`;

      } else {

        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid platform' }),
        };

      }

      const buildRef = await db.collection('appBuilds').add({
        schoolId,
        platform,
        status: 'completed',
        fileName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          buildId: buildRef.id,
          message: 'App generated successfully',
        }),
      };

    }

    // Download app
    if (path.startsWith('download/') && event.httpMethod === 'GET') {

      const buildId = path.split('/')[1];

      const buildDoc = await db.collection('appBuilds').doc(buildId).get();

      if (!buildDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Build not found' }),
        };
      }

      const build = buildDoc.data();

      if (decoded.schoolId !== build.schoolId) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Forbidden' }),
        };
      }

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${build.fileName}"`,
        },
        body: JSON.stringify({ message: 'App download' }),
      };

    }

    // Get build status
    if (path.startsWith('status/') && event.httpMethod === 'GET') {

      const buildId = path.split('/')[1];

      const buildDoc = await db.collection('appBuilds').doc(buildId).get();

      if (!buildDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Build not found' }),
        };
      }

      const build = buildDoc.data();

      if (decoded.schoolId !== build.schoolId) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Forbidden' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          buildId,
          status: build.status,
          platform: build.platform,
          fileName: build.fileName,
          createdAt: build.createdAt,
        }),
      };

    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error) {

    console.error('Apps function error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };

  }

};
