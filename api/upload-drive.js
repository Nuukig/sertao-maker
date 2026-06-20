const { google } = require('googleapis');
const { Readable } = require('stream');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, mimeType, fileBase64, folderId } = req.body;

    if (!fileName || !mimeType || !fileBase64) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios faltando' });
    }

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      return res.status(500).json({ error: 'Credenciais do Google não configuradas' });
    }

    const credentials = JSON.parse(serviceAccountJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileBuffer = Buffer.from(fileBase64, 'base64');
    const stream = Readable.from(fileBuffer);

    const driveFolder = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        parents: driveFolder ? [driveFolder] : [],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id,name,webViewLink,webContentLink',
    });

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Drive upload error:', error);
    return res.status(500).json({ error: error.message });
  }
};
