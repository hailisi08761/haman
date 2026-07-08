import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { exec } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const port = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Static route for exported invoices
  const exportsDir = path.resolve('./exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }
  app.use('/exports', express.static(exportsDir));

  // Ensure templates folder exists
  const templatesDir = path.resolve('./templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // Initialize Gemini AI Client
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API endpoint for parsing products
  app.post('/api/parse-products', async (req, res) => {
    try {
      const { rawText } = req.body;
      if (!rawText) {
        return res.status(400).json({ error: 'Missing rawText parameter' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY is not configured. Please configure it in the Secrets panel.' 
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Please parse the following raw product description text into a structured list of products for a Proforma Invoice.
Each product should have the following properties:
- pic_name: A generic short name describing the item under "Pic show", e.g. "Firepit" or "Carbon Steel Grate". Keep it short.
- size_mm: Detailed product specifications including materials, size, panel thickness, assembly size, support legs, and color. It MUST include labels like "Material:", "Thickness:" or similar where applicable, and separate items with line breaks. Use the exact formatting of this example:
  Material: Carbon steel
  Panel thickness: 2.5mm
  Assembly size: 600*600*280mm
  Support legs: 3 (each leg 140*30)
- package_size: Package size, e.g., "640*640*165mm".
- nw: Net weight (ctn/kg), e.g., "10.6KG".
- gw: Gross weight (ctn/kg), e.g., "12.1KG".
- hs_code: HS code, e.g., "7326909000". If unknown or not specified, use "7326909000".
- qty: Quantity (number of sets), e.g., 100.
- fob_usd: FOB price per set in USD as a number, e.g., 20.00.

Return a clean JSON array of objects. Be precise and capture all numerical specifications accurately from the user's input.

Raw text:
${rawText}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pic_name: { type: Type.STRING },
                size_mm: { type: Type.STRING },
                package_size: { type: Type.STRING },
                nw: { type: Type.STRING },
                gw: { type: Type.STRING },
                hs_code: { type: Type.STRING },
                qty: { type: Type.NUMBER },
                fob_usd: { type: Type.NUMBER },
              },
              required: ['pic_name', 'size_mm', 'package_size', 'nw', 'gw', 'hs_code', 'qty', 'fob_usd'],
            },
          },
        },
      });

      const parsedText = response.text || '[]';
      const parsedData = JSON.parse(parsedText);
      res.json({ success: true, products: parsedData });
    } catch (error: any) {
      console.error('Gemini parsing error:', error);
      res.status(500).json({ error: error.message || 'Failed to parse products' });
    }
  });

  // API endpoint for dynamic Excel export using openpyxl Python template engine
  app.post('/api/export-excel', async (req, res) => {
    try {
      const data = req.body;
      const refNo = data.referenceNo || 'UNNAMED';
      
      // Clean and generate filename conforming to rules: Invoice_{Invoice_No}.xlsx
      const sanitizedRefNo = refNo.replace(/[^a-zA-Z0-9_\-]/g, '_');
      const tempJsonFileName = `export_temp_${sanitizedRefNo}_${Date.now()}.json`;
      const tempJsonPath = path.join(templatesDir, tempJsonFileName);
      
      const templatePath = path.join(templatesDir, 'Proforma invoice-Aimi-Firepit.xlsx');
      const outputFileName = `Invoice_${sanitizedRefNo}.xlsx`;
      const outputPath = path.join(exportsDir, outputFileName);

      // Write request payload to temp JSON file for Python script consumption
      fs.writeFileSync(tempJsonPath, JSON.stringify(data, null, 2), 'utf-8');

      // Command line execution: python3 export_excel.py <json_path> <template_path> <output_path>
      const cmd = `python3 export_excel.py "${tempJsonPath}" "${templatePath}" "${outputPath}"`;
      
      exec(cmd, (err, stdout, stderr) => {
        // Cleanup temp file
        try {
          if (fs.existsSync(tempJsonPath)) {
            fs.unlinkSync(tempJsonPath);
          }
        } catch (cleanupErr) {
          console.error('Failed to cleanup temp JSON file:', cleanupErr);
        }

        if (err) {
          console.error('Python execution error:', err, stderr);
          return res.status(500).json({ 
            error: 'Failed to generate Excel from template', 
            details: stderr || err.message 
          });
        }

        console.log('Python export stdout:', stdout);
        
        // Return download URL
        res.json({ 
          success: true, 
          downloadUrl: `/exports/${outputFileName}`,
          fileName: outputFileName
        });
      });

    } catch (error: any) {
      console.error('Export Excel API error:', error);
      res.status(500).json({ error: error.message || 'Failed to export Excel' });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve('./dist')));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve('./dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
