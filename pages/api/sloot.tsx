import { Contract, JsonRpcProvider } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';

import satori from "satori";
import sharp from "sharp";
import { readFile, writeFile } from "fs";
import svg2img from "svg2img";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {

        console.log("sloot req:", req);

        try {

            const add = req.query["address"];

            const sloot = new Contract("0x869Ad3Dfb0F9ACB9094BA85228008981BE6DBddE", ["function tokenURI(address) public view returns (string)",], new JsonRpcProvider("https://rpc.mevblocker.io"));
            // console.log("sloot:", sloot);
            const tokenURIB64 = await sloot.tokenURI(add);
            // console.log("tokenUTIB64", tokenURIB64);
            const tokenURI = JSON.parse(Buffer.from(tokenURIB64.split(",")[1], 'base64').toString("utf8"))
            // console.log("tokenURI:", tokenURI);
            const b64svg = tokenURI.image;
            // console.log("b64svg:", b64svg);
            const svg = Buffer.from(b64svg.split(",")[1], 'base64').toString("utf8")
            // console.log("svg:", svg);

            const items = itemsFromSvg(svg)
            // console.log("items:", items)

            const tokenURIWithColor = renderWithColors(items);
            // console.log("lootWithColor:", tokenURIWithColor);
            const lootWithColor = "data:image/svg+xml;base64," + Buffer.from(tokenURIWithColor).toString('base64');

            // const img = await getImageForLoot(items)
            // console.log("img:", img)

            const satoriSvg = await satori(
                <div style={ {backgroundColor: "black", display: "flex", width: 1910, height: 1000} }>
                    { <img alt="loot" style={ {float: "left"} } src={ lootWithColor }/> }
                </div>
                , {width: 1910, height: 1000, fonts: []});
            console.log("satoriSvg:", satoriSvg);

            // const result = "data:image/svg+xml;base64," + Buffer.from(satoriSvg).toString('base64');
            // console.log("satoriSvg:", result);

            // const pngBuffer = await sharp(Buffer.from(satoriSvg))
            //     .toFormat("png")
            //     .toBuffer();

            res.setHeader('Content-Type', 'image/svg');
            res.setHeader('Cache-Control', 'max-age=10');
            // res.send(snap);
            res.send(Buffer.from(satoriSvg));

        } catch (error) {
            console.error(error);
            res.status(500).send('Error generating image');
        }

    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }

}

function renderWithColors(items: string[]) {
    if (!items) {
        return items;
    }

    let result = "<svg xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMinYMin meet\" viewBox=\"0 0 350 350\">\n" +
        "  <style>\n" +
        "    .base {\n" +
        "      fill: white;\n" +
        "      font-family: serif;\n" +
        "      font-size: 14px;\n" +
        "    }\n" +
        "\n" +
        "    .green {\n" +
        "      fill: green;\n" +
        "      font-family: serif;\n" +
        "      font-size: 14px;\n" +
        "    }\n" +
        "\n" +
        "    .orange {\n" +
        "      fill: orange;\n" +
        "      font-family: serif;\n" +
        "      font-size: 14px;\n" +
        "    }\n" +
        "  </style>\n" +
        "  <rect width=\"100%\" height=\"100%\" fill=\"black\" />";

    for (let i = 0; i < items.length; i++) {
        result += "<text x=\"10\" y=\"" + (i * 20 + 20).toString(10) + getLevelColor(items[i]);
    }

    return result + "</svg>";

}

function getLevelColor(item: string) {

    if (item.startsWith("P")) {
        return "\" class=\"base green\"> " + item + "</text>";
    }
    if (item.startsWith("C")) {
        return "\" class=\"base orange\"> " + item + "</text>";
    }
    return "\" class=\"base\"> " + item + "</text>";

}

// https://github.com/stephancill/synthetic-loot-viewer
function itemsFromSvg(svg: string) {
    if (!svg.startsWith("<svg")) {
        throw new Error("The svg parameter does not seem to be an SVG");
    }

    let matches;
    const items = [];
    for (let i = 0; i < 8; i++) {
        // eslint-disable-next-line
        const matcher = /<text[^>]+\>([^<]+)<\/text>/
        matches = svg.match(matcher);
        if (!matches) {
            if (items.length === 0) {
                throw new Error(
                    "Error when parsing the SVG: couldn’t find the next item"
                );
            }
            // Probably a LootLoose image
            return items;
        }
        items.push(matches[1]);
        svg = svg.slice(svg.indexOf(matches[0]) + matches[0].length);
    }
    return items;
}

