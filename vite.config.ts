import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';
import JSZip from 'jszip';

function addDirectoryToZip(zip: JSZip, folderPath: string, rootPath: string) {
  if (!fs.existsSync(folderPath)) return;
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    const fullPath = path.join(folderPath, item);
    const relPath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      addDirectoryToZip(zip, fullPath, rootPath);
    } else {
      const fileData = fs.readFileSync(fullPath);
      zip.file(relPath, fileData);
    }
  }
}

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'stripe-mock-api-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/api/v1/stripe-config' && req.method === 'GET') {
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_stripe_india_iob',
                  amount: 3000,
                  currency: 'myr',
                  planName: 'Driver 30-Day Active Subscription Pack',
                  payoutBank: 'IOB (Indian Overseas Bank) - Stripe India Export Services',
                  accountStatus: 'Application in progress / Live simulation active',
                })
              );
              return;
            }

            if (req.url === '/api/v1/stripe-create-payment-intent' && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body || '{}');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(2, 10)}`,
                      paymentIntentId: `pi_${Date.now()}`,
                      amount: data.amount || 3000,
                      currency: 'myr',
                      payoutBank: 'Indian Overseas Bank (IOB)',
                      message: 'PaymentIntent generated successfully',
                    })
                  );
                } catch {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
              });
              return;
            }

            if (req.url === '/api/v1/stripe-webhook' && req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => { body += chunk; });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body || '{}');
                  const driverId = data.driverId || data.data?.object?.metadata?.driverId;
                  const newExpiry = new Date(Date.now() + 30 * 86400000).toISOString();
                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      received: true,
                      status: 'success',
                      driverId,
                      activatedForDays: 30,
                      newSubscriptionExpiry: newExpiry,
                      payoutBank: 'Indian Overseas Bank (IOB)',
                      message: `Driver profile automatically updated to ACTIVE for 30 days.`,
                    })
                  );
                } catch {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Invalid webhook payload' }));
                }
              });
              return;
            }

            if ((req.url === '/api/v1/download-android-project' || req.url === '/api/download-android-project') && req.method === 'GET') {
              try {
                const androidDir = path.resolve(import.meta.dirname || '.', 'android');
                if (!fs.existsSync(androidDir)) {
                  res.statusCode = 404;
                  res.end(JSON.stringify({ error: 'Direktori android tidak dijumpai' }));
                  return;
                }
                const zip = new JSZip();
                addDirectoryToZip(zip, androidDir, androidDir);
                zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } })
                  .then((buffer) => {
                    res.setHeader('Content-Type', 'application/zip');
                    res.setHeader('Content-Disposition', 'attachment; filename="DeliveryMY-Android-Studio-Project.zip"');
                    res.setHeader('Content-Length', buffer.length);
                    res.end(buffer);
                  })
                  .catch((err) => {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: err.message }));
                  });
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
              return;
            }

            next();
          });
        },
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
