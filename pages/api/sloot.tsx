import { Contract, JsonRpcProvider } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';

import puppeteer from "puppeteer";
import satori from "satori";
import sharp from "sharp";
// import chromium from 'chrome-aws-lambda';
import { readFile, writeFile } from "fs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        
        try {
            
            const add = req.query["address"];
            
            const path = "./cache/" + add;
            console.log("path: ", path);
            readFile(path, "utf8", (err, data) => {
                if (err) {
                    console.error(err);
                }
                if (data) {
                    res.setHeader('Content-Type', 'image/png');
                    res.setHeader('Cache-Control', 'max-age=10');
                    res.send(Buffer.from(data, 'base64'));
                }
            })
            
            const browser = await puppeteer.launch({
                args: ['--window-size=1910,1000'],
            })
            
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
            
            
            const sloot = new Contract("0x869Ad3Dfb0F9ACB9094BA85228008981BE6DBddE", ["function tokenURI(address) public view returns (string)",], new JsonRpcProvider("https://rpc.mevblocker.io"));
            // console.log("sloot:", sloot);
            const tokenURIB64 = await sloot.tokenURI(add);
            // console.log("tokenUTIB64", tokenURIB64);
            const tokenURI = JSON.parse(Buffer.from(tokenURIB64.split(",")[1], 'base64').toString("utf8"))
            // console.log("tokenURI:", tokenURI);
            const b64svg = tokenURI.image;
            // console.log("b64svg:", b64svg);
            // const svg = Buffer.from(b64svg.split(",")[1], 'base64').toString("utf8")
            // console.log("svg:", svg);
            
            
            // const items = itemsFromSvg(svg)
            // console.log("items:", items)
            // const img = await getImageForLoot(items)
            // console.log("img:", img)
            
            const satoriSvg = await satori(
                <div className="card" style={ {backgroundColor: "black", display: "flex"} }>
                    <img alt="loot" style={ {width: "50%", float: "left"} } src={ b64svg }/>
                    <img alt="character" style={ {width: "50%", float: "right"} } src={ img || "" }/>
                </div>
                , {width: 1910, height: 1000, fonts: []});
            
            const result = "data:image/svg+xml;base64," + Buffer.from(satoriSvg).toString('base64');
            
            await page.setViewport({width: 1910, height: 1000});
            await page.goto(result || "about:blank", {waitUntil: "load"});
            
            const snap = await page.screenshot();
            console.log("snap:", snap);
            
            writeFile(path, snap.toString("base64"), (err) => {
                if (err) {
                    console.error(err);
                }
                console.log("saved");
            })
            
            // const png = await sharp(satoriSvg)
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
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
}

