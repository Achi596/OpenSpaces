import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

export { uploadImage };

async function login(baseURL) {
  const form = {
    username: 'admin',
    password: process.env.CDN_ADMIN_PASSWORD || 'WDFX3zJz91VAia'
  };

  try {
    const response = await axios.post(`${baseURL}/api/user/login`, form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data.data.jwt_token;;
  } catch {
    throw new Error('Oh no Pookie, the login failed! ＞﹏＜');
  }
}

async function uploadImage(imageBuffer, fileName) {
  const baseURL = process.env.CDN_BASEURL ||
   'https://cdn.openspaces.penguinserver.net';

  try {
    const token = await login(baseURL);
    const form = new FormData();
    form.append('image', imageBuffer, { filename: fileName });

    const response = await axios.post(`${baseURL}/api/image/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`,
      },
    });

    const { id } = response.data.data;
    const fileExtension = path.extname(fileName);

    if (!fileExtension) {
      throw new Error('File extension is missing from upload');
    }

    const imageURL = `${baseURL}/i/${id}${fileExtension}`;

    return imageURL;

  } catch {
    throw new Error('CDN Error. Please try again later');
  }
}
