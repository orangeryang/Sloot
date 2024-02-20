import { Contract, JsonRpcProvider } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getImageForLoot, itemsFromSvg } from "@/utils";
import sharp from "sharp";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method === 'GET') {
        
        // console.log("sloot req:", req);
        
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
            // const lootWithColor = "data:image/svg+xml;base64," + Buffer.from(tokenURIWithColor).toString('base64');
            
            const img = await getImageForLoot(items)
            // console.log("img:", img)
            
            const character = await sharp(Buffer.from(img.split(",")[1], 'base64'))
                .resize(800, 900)
                .toBuffer();
            
            const pngBuffer = await sharp(Buffer.from(tokenURIWithColor))
                .resize(1910, 1000)
                .composite([{input: character, gravity: "northeast"}])
                .png()
                .toBuffer();
            
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'max-age=10');
            // res.send(svg);
            res.send(pngBuffer);
            
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

// METAL_ARMOR
//
//     1: ["Holy Chestplate", "Ancient Helm", "Ornate Belt", "Holy Greaves", "Holy Gauntlets"],
//     2: ["Ornate Chestplate", "Ornate Helm", "War Belt", "Ornate Greaves", "Ornate Gauntlets"],
//     3: ["Plate Mail", "Great Helm", "Plated Belt", "Greaves", "Gauntlets"],
//     4: ["Chain Mail", "Full Helm", "Mesh Belt", "Chain Boots", "Chain Gloves"],
//     5: ["Ring Mail", "Helm", "Heavy Belt", "Heavy Boots", "Heavy Gloves"]
//
//
// HIDE_ARMOR
//
//     1: ["Demon Husk", "Demon Crown", "Demonhide Belt", "Demonhide Boots", "Demons Hands"],
//     2: ["Dragonskin Armor", "Dragons Crown", "Dragonskin Belt", "Dragonskin Boots", "Dragonskin Gloves"],
//     3: ["Studded Leather Armor", "War Cap", "Studded Leather Belt", "Studded Leather Boots", "Studded Leather Gloves"],
//     4: ["Hard Leather Armor", "Leather Cap", "Hard Leather Belt", "Hard Leather Boots", "Hard Leather Gloves"],
//     5: ["Leather Armor", "Cap", "Leather Belt", "Leather Boots", "Leather Gloves"]
//
//
// CLOTH_ARMOR
//
//     1: ["Divine Robe", "Crown", "Brightsilk Sash", "Divine Slippers", "Divine Gloves"],
//     2: ["Silk Robe", "Divine Hood", "Silk Hood", "Silk Sash", "Silk Slippers", "Silk Gloves"],
//     3: ["Linen Robe", "Silk Sash", "Wool Sash", "Wool Shoes", "Wool Gloves"],
//     4: ["Robe", "Linen Hood", "Linen Sash", "Linen Shoes", "Linen Gloves"],
//     5: ["Shirt", "Hood", "Sash", "Shoes", "Gloves"]
//
//
// WEAPONS
//
//     1: ["Katana", "Warhammer", "Ghost Wand", "Grimoire"],
//     2: ["Falchion", "Quarterstaff", "Grave Wand", "Chronicle"],
//     3: ["Scimitar", "Maul", "Bone Wand", "Tome"],
//     4: ["Long Sword", "Mace", "Wand", "Book"],
//     5: ["Short Sword", "Club"]

const tier1 = ["Holy Chestplate", "Ancient Helm", "Ornate Belt", "Holy Greaves", "Holy Gauntlets", "Demon Husk", "Demon Crown", "Demonhide Belt", "Demonhide Boots", "Demons Hands", "Divine Robe", "Crown", "Brightsilk Sash", "Divine Slippers", "Divine Gloves", "Katana", "Warhammer", "Ghost Wand", "Grimoire"];
const tier2 = ["Ornate Chestplate", "Ornate Helm", "War Belt", "Ornate Greaves", "Ornate Gauntlets", "Dragonskin Armor", "Dragons Crown", "Dragonskin Belt", "Dragonskin Boots", "Dragonskin Gloves", "Silk Robe", "Divine Hood", "Silk Hood", "Silk Sash", "Silk Slippers", "Silk Gloves", "Falchion", "Quarterstaff", "Grave Wand", "Chronicle"];
const tier3 = ["Plate Mail", "Great Helm", "Plated Belt", "Greaves", "Gauntlets", "Studded Leather Armor", "War Cap", "Studded Leather Belt", "Studded Leather Boots", "Studded Leather Gloves", "Linen Robe", "Silk Sash", "Wool Sash", "Wool Shoes", "Wool Gloves", "Scimitar", "Maul", "Bone Wand", "Tome"];
const tier4 = ["Chain Mail", "Full Helm", "Mesh Belt", "Chain Boots", "Chain Gloves", "Hard Leather Armor", "Leather Cap", "Hard Leather Belt", "Hard Leather Boots", "Hard Leather Gloves", "Robe", "Linen Hood", "Linen Sash", "Linen Shoes", "Linen Gloves", "Long Sword", "Mace", "Wand", "Book"];
const tier5 = ["Ring Mail", "Helm", "Heavy Belt", "Heavy Boots", "Heavy Gloves", "Leather Armor", "Cap", "Leather Belt", "Leather Boots", "Leather Gloves", "Shirt", "Hood", "Sash", "Shoes", "Gloves", "Short Sword", "Club"];

function getWords(item: string) {
    
    if (item.startsWith("\"")) {
        item = item.split("\"")[2].slice(1);
    }
    if (item.indexOf("of") >= 0) {
        item = item.split(" of ")[0];
    }
    if (item.endsWith("+1")) {
        item = item.slice(0, -2);
    }
    
    // console.log("item:", item);
    return item;
    
}

function getLevelColor(item: string) {
    
    const words = getWords(item);
    
    if (tier1.includes(words)) {
        return "\" class=\"base orange\"> " + item + "</text>";
    }
    if (tier2.includes(words)) {
        return "\" class=\"base purple\"> " + item + "</text>";
    }
    if (tier3.includes(words)) {
        return "\" class=\"base blue\"> " + item + "</text>";
    }
    if (tier4.includes(words)) {
        return "\" class=\"base green\"> " + item + "</text>";
    }
    
    return "\" class=\"base\"> " + item + "</text>";
    
}

function renderWithColors(items: string[]) {
    
    if (!items) {
        return items;
    }
    
    let result = "<svg xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMinYMin meet\" viewBox=\"0 0 660 350\"> <style>    .base {        fill: rgb(255, 255, 255);        font-family: serif;        font-size: 13px;    }    .green {        fill: rgb(30, 255, 0);        font-family: serif;        font-size: 13px;    }    .blue {        fill: rgb(0, 112, 221);        font-family: serif;        font-size: 13px;    }    .purple {        fill: rgb(163, 53, 238);        font-family: serif;        font-size: 13px;    }    .orange {        fill: rgb(255, 128, 0);        font-family: serif;        font-size: 13px;    }</style><rect width=\"100%\" height=\"100%\" fill=\"black\" />";
    
    for (let i = 0; i < items.length; i++) {
        result += "<text x=\"10\" y=\"" + (i * 20 + 20).toString(10) + getLevelColor(items[i]);
    }
    
    return result + "</svg>";
    
}




