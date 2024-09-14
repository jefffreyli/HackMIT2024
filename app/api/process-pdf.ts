import { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false, // We are handling the file upload
  },
};

const extractTextFromPDF = async (pdfBuffer: Buffer) => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  let text = '';
  const pages = pdfDoc.getPages();

  pages.forEach(async page => {
    text += await page.
  });

  return text;
};

const generateSongPrompt = async (text: string) => {
  const gptResponse = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `Create a music song prompt from the following book text: ${text}` },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );
  
  const songPrompt = gptResponse.data.choices[0].message.content;
  return songPrompt;
};

const generateMusicFromPrompt = async (prompt: string) => {
  const sunoResponse = await axios.post(
    'https://suno-api.com/generate-music',
    { prompt },
    {
      headers: {
        Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
      },
    }
  );

  return sunoResponse.data.musicLink;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

  try {
    // Extract text from PDF
    const extractedText = await extractTextFromPDF(pdfBuffer);

    // Generate song prompt from GPT
    const songPrompt = await generateSongPrompt(extractedText);

    // Generate music from Suno API
    const musicLink = await generateMusicFromPrompt(songPrompt);

    return res.status(200).json({ musicLink });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
