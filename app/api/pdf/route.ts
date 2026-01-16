import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let browser = null;
  try {
    const { html, theme } = await req.json();

    // 🛠️ LOCAL vs PRODUCTION Logic
    const isLocal = process.env.NODE_ENV === 'development';
    
    // Windows/Local path (Ye change kar lena agar aapka Chrome kisi aur path par hai)
    const localExecutablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; 

    browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args,
      defaultViewport: { width: 1280, height: 720 },
      executablePath: isLocal ? localExecutablePath : await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    
    // Theme setup
    await page.evaluateOnNewDocument((t) => {
      document.documentElement.setAttribute('data-theme', t);
    }, theme);

    // Render HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      preferCSSPageSize: true
    });

    await browser.close();
    const pdfBuffer = Buffer.from(pdfUint8Array);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="quote.pdf"',
      },
    });

  } catch (error: any) {
    console.error("Puppeteer Server Error:", error);
    if (browser) await (browser as any).close();
    return NextResponse.json(
      { error: 'PDF Generation Failed', details: error.message }, 
      { status: 500 }
    );
  }
}