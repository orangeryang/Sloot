import type { NextApiRequest, NextApiResponse } from 'next';

// import sharp from 'sharp';
// import satori from "satori";
// import { ethers, JsonRpcProvider, Contract } from "ethers";
// import SyntheticLootArtifact from "../../public/SyntheticLoot.json";
// import map from "../../public/map.json";
// import { itemsFromSvg, getImageForLoot } from "@/app/sloot/loot-utils";


// const IMG_DIR = `ipfs://${map.ipfs.character_imgs}`;


import puppeteer from "puppeteer";
import chromium from 'chrome-aws-lambda';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {

        try {

            const add = req.query["address"];

            const browser = await chromium.puppeteer.launch({
                args: [...chromium.args, "--hide-scrollbars", "--disable-web-security", '--window-size=1910,1000'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: true,
                ignoreHTTPSErrors: true,
            })

            // const browser = await puppeteer.launch(/*{headless: false}*/{args: ['--window-size=1910,1000']});
            const page = await browser.newPage();
            await page.goto("https://loot.stephancill.co.za/#/address/" + add, {waitUntil: "load"});
            await page.waitForSelector("#root > div > div:nth-child(4) > div.TokenCard_tokenCard__2xW3d > div > div:nth-child(2) > div > div > div.Token_token__2gp1y > img", {timeout: 50000});
            // #root > div > div:nth-child(4) > div.TokenCard_tokenCard__2xW3d > div > div:nth-child(2) > div > div > div.Token_token__2gp1y > img
            const img = await page.$eval("#root > div > div:nth-child(4) > div.TokenCard_tokenCard__2xW3d > div > div:nth-child(2) > div > div > div.Token_token__2gp1y > img", el => {
                console.log(el);
                return el.getAttribute("src");
            })
            // console.log(img);

            // const svg = await satori(
            //     <img src={img} alt={""}/>,
            //     {width: 1910, height: 1000, fonts: []}
            // );

            await page.setViewport({width: 1910, height: 1000});
            await page.goto(img||"about:blank", {waitUntil: "load"});

            const snap = await page.screenshot();

            // const sloot = new Contract("0x869Ad3Dfb0F9ACB9094BA85228008981BE6DBddE", ["function tokenURI(address) public view returns (string)",], new JsonRpcProvider("https://rpc.mevblocker.io"));
            // // console.log("sloot:", sloot);
            // const tokenURIB64 = await sloot.tokenURI(/*address[0]*/"0x8e675b3B721af441E908aB2597C1BC283A0D1C4d");
            // // console.log("tokenUTIB64", tokenURIB64);
            // const tokenURI = JSON.parse(Buffer.from(tokenURIB64.split(",")[1], 'base64').toString("utf8"))
            // // console.log("tokenURI:", tokenURI);
            // const b64svg = tokenURI.image;
            // // console.log("b64svg:", b64svg);
            // const svg = Buffer.from(b64svg.split(",")[1], 'base64').toString("utf8")
            // // console.log("svg:", svg);
            //
            // const items = itemsFromSvg(svg)
            // console.log("items:", items)
            // const img = await getImageForLoot(items)
            // console.log("img:", img)

            //
            // const satoriSvg = await satori(
            //     <div className="card" style={{backgroundColor: "white", marginTop: "15px"}}>
            //         <img alt="character" style={{borderRadius: "5px", width: "100%"}} src={img}/>
            //         <ul style={{marginLeft: "-20px"}}>{items.map(item => {
            //             return <li key={item}>{item}</li>
            //         })}
            //         </ul>
            //     </div>, {width: 600, height: 400, fonts: []});
            //


            // const png = await sharp(snap)
            //     .toFormat('png')
            //     .toBuffer();

            // Set the content type to PNG and send the response
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'max-age=10');
            res.send(snap);

        } catch
            (error) {
            console.error(error);
            res.status(500).send('Error generating image');
        }

    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

