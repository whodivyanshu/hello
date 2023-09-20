import fs from 'fs';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import { readFile, writeFile } from 'fs/promises';
import csvtojson from 'csvtojson';
import { eachOfLimit } from 'async';

const runPuppeteer = async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const csvFile = await csvtojson().fromFile('core2.csv');
        const finalData = [];
        await eachOfLimit(csvFile, 10, async (row) => {
            const page = await browser.newPage();
            const sku = row['Core Products Item #'];
            const url = `https://b2b.coreproducts.com/pages/search-results-page?type=article%2Cpage%2Cproduct&q=${sku}`;
            await page.goto(url);

            try {
                await page.waitForSelector('.snize-search-results-content li', { timeout: 5000 }); // Adjust the timeout as needed
                await page.click('.snize-search-results-content li');

                await page.waitForSelector("#static-product-form-0data-product-option-0 option", { timeout: 5000 }); // Adjust the timeout as needed

                // Use Cheerio to load the page content
                const $ = cheerio.load(await page.content());

                const selectElement = $("select[name='id']");
                const sku = selectElement.find("option[selected='selected']").attr('data-sku');
                const optionData = [];
                selectElement.find("option").each((index, element) => {
                    const option = $(element);
                    const optionText = option.text().trim();
                    const dataSku = option.attr('data-sku');
                    const texttt = `Option Text: ${optionText}, Data SKU: ${dataSku}`;
                    optionData.push({
                        text: optionText,
                        dataSku: dataSku
                    })

                });
                finalData.push({
                    sku: sku,
                    options: optionData
                });
            } catch (error) {
                console.error(`Error processing SKU ${sku}:`, error);
            } finally {
                // Close the page to free up memory
                await page.close();
            }
        });

        await writeFile('output.json', JSON.stringify(finalData, null, 2));

        await browser.close();
    } catch (error) {
        console.error("Error running Puppeteer script:", error);
    }
};

runPuppeteer();

