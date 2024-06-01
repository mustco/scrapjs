import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Mendapatkan __dirname dalam ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi untuk mengunduh dan menyimpan gambar
const downloadImage = async (url, filename) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await fs.writeFile(filename, response.data);
        console.log(`Successfully downloaded ${filename}`);
    } catch (error) {
        console.error(`Failed to download ${url}:`, error.message);
    }
};

const main = async () => {
    try {
        // Step 1: Fetch the webpage content
        const response = await axios.get("https://coc.guide/troop");
        const $ = cheerio.load(response.data);

        // Ensure the 'images' directory exists
        const imagesDir = path.join(__dirname, 'images');
        await fs.ensureDir(imagesDir);

        // Step 2: Extract image URLs and download images
        const downloadPromises = [];
        $("div.item-link a img").each((i, element) => {
            const imgSrc = $(element).attr("src");
            if (imgSrc) {
                const fullUrl = `https://coc.guide${imgSrc}`;
                const filename = path.join(imagesDir, path.basename(imgSrc));
                downloadPromises.push(downloadImage(fullUrl, filename));
            }
        });

        // Wait for all downloads to complete
        await Promise.all(downloadPromises);
        console.log('All images downloaded.');
    } catch (error) {
        console.error('Error fetching the webpage:', error.message);
    }
};

main();
