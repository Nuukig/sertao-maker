const { google } = require('googleapis');
const { Readable } = require('stream');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, mimeType, fileBase64, folderId } = req.body;

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileBuffer = Buffer.from(fileBase64, 'base64');
    const stream = Readable.from(fileBuffer);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        parents: [folderId || process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id,name,webViewLink,webContentLink',
    });

    // Tornar o arquivo público (leitura)
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
}
