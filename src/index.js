const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');


const visitedUrls = new Set();

const websiteUrl = process.argv[2];
const outputDir = './';

if (!websiteUrl) {
    console.error('\x1b[31mERROR\x1b[0m Usage: node index.js <Website URL>');
    process.exit(1);
}

console.log(`
    \x1b[31m ██╗    ██╗ ██████╗███████╗\x1b[0m
    \x1b[31m ██║    ██║██╔════╝██╔════╝\x1b[0m
    \x1b[31m ██║ █╗ ██║██║     █████╗\x1b[0m  
    \x1b[31m ██║███╗██║██║     ██╔══╝\x1b[0m  
    \x1b[31m ╚███╔███╔╝╚██████╗███████╗\x1b[0m
    \x1b[31m  ╚══╝╚══╝  ╚═════╝╚══════╝\x1b[0m
    
    \x1b[32mINFO\x1b[0m Website Content Exporter powered by https://github.com/IceyMountain
    \x1b[32mINFO\x1b[0m Loading Modules & Script.
`)
const mainExportFileName = `${path.basename(websiteUrl)}.txt`;
const mainExportFile = path.join(outputDir, mainExportFileName);
fs.writeFileSync(mainExportFile, '');

if (fs.existsSync('./cache.txt')) {
    const savedUrls = fs.readFileSync('./cache.txt', 'utf-8').split('\n').filter(Boolean);
    savedUrls.forEach(url => visitedUrls.add(url));
}

async function fetchHTML(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`    \x1b[31mERROR\x1b[0m Error fetching ${url}: ${error}`);
        return null;
    }
}

function extractText(html) {
    const $ = cheerio.load(html);
    const textContent = [];

    $('p, h1, h2, h3, h4, h5, h6, span, li, a').each((index, element) => {
        const text = $(element).text().trim();
        if (text) {
            textContent.push(text);
        }
    });

    return textContent.join(' ');
}

async function exportWebsiteText(baseUrl, mainExportFile, depth = 3) {
    try {
        const normalizedUrl = new URL(baseUrl).origin + new URL(baseUrl).pathname;

        if (visitedUrls.has(normalizedUrl)) {
            console.log(`    \x1b[33mWARNING\x1b[0m Skipping already visited URL: ${baseUrl}`);
            return;
        }

        visitedUrls.add(normalizedUrl);
        fs.appendFileSync('./cache.txt', normalizedUrl + '\n');

        const html = await fetchHTML(baseUrl);
        if (!html) return;

        const textContent = extractText(html);

        fs.appendFileSync(mainExportFile, textContent + '\n');
        console.log(`    \x1b[32mSUCCESS\x1b[0m Text from ${baseUrl} exported.`);

        const $ = cheerio.load(html);
        const foundUrls = new Set();

        $('a').each((index, element) => {
            const subpageUrl = $(element).attr('href');
            if (subpageUrl) {
                const fullSubpageUrl = new URL(subpageUrl, baseUrl).toString();
                if (new URL(fullSubpageUrl).hostname.includes(new URL(websiteUrl).hostname) && !visitedUrls.has(fullSubpageUrl)) {
                    foundUrls.add(fullSubpageUrl);
                }
            }
        });

        if (depth > 0) {
            const urls = Array.from(foundUrls);
            for (let i = 0; i < urls.length; i += 5) {
                const batch = urls.slice(i, i + 5);
                await Promise.all(batch.map(url => exportWebsiteText(url, mainExportFile, depth - 1)));
            }
        }
    } catch (error) {
        console.error(`    \x1b[31mERROR\x1b[0m exporting website text: ${error}`);
    }
}

exportWebsiteText(websiteUrl, mainExportFile);
