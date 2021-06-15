/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

const AWS = require('aws-sdk')
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const chromium = require('chrome-aws-lambda');

const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

exports.handler = async (event, context) => {

  let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();
    await page.setUserAgent(agent)


    let sites = ["https://ynet.co.il", "https://www.haaretz.co.il/"];

    for (let site of sites) {
      console.log('Navigating to page: ', site)
      await page.goto(site, { waitUntil: 'load', timeout: 0 })

      const [button] = await page.$x("//button[contains(., 'Consent')]");
      const [button2] = await page.$x("/html/body/div[1]/div[4]/div[2]/div/button");

      if (button) {
        await button.click();
      }

      if (button2) {
        await button2.click();
      }



      // const buffer = await page.screenshot()
      const buffer = await page.screenshot({ fullPage: true });
      result = await page.title()

      // upload the image using the current timestamp as filename
      const fileName = site.replace(/(^\w+:|^)\/\//, '');

      const s3result = await s3
        .upload({
          Bucket: process.env.S3_BUCKET,
          Key: `${fileName}_${Date.now()}.png`,
          Body: buffer,
          ContentType: 'image/png',
          ACL: 'public-read'
        })
        .promise()

      console.log('S3 image URL:', s3result.Location)
    }


    await page.close();
    await browser.close();

  } catch (error) {
    console.log(error)
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return result
}