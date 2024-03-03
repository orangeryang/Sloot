import type { NextApiRequest, NextApiResponse } from 'next';
import { getImageForLoot, itemsFromSvg } from "@/utils";
import { Battle, BattleDetail, PrismaClient } from "@prisma/client";
import { Contract, JsonRpcProvider } from "ethers";
import sharp from "sharp";
import satori from "satori";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === 'get') {

        const id = req.query["id"];
        if (!id) {
            return res.status(400).send(`Failed to generate image: id not found`);
        }
        console.log("battle id:", id);

        const prisma = new PrismaClient();

        const battle = await prisma.battle.findUnique({
            where: {
                id: Number.parseInt(id.toString()),
            }
        })
        console.log("find battle:", battle);

        if (!battle) {
            console.warn("generate image: battle not found:", id);
            return res.status(400).send(`Failed to generate image: battle not found`);
        }

        const battleDetails = await prisma.battleDetail.findMany({
            where: {
                battleId: Number.parseInt(id.toString()),
            }
        })
        console.log("find battleDetails:", battleDetails);

        await prisma.$disconnect();

        const len = battleDetails.length;
        const leftAddress = req.query["address"] || battle.attacker;
        const rightAddress = battle.defender;

        const battleLog = generateLog(battleDetails, battle);

        const logImage = await satori(
            <div>
                <div style={{fontFamily: "serif", fontSize: "13px", width: "600px", height: "800px", color: "white"}}>
                    {battleLog.map((item) => (
                        <div>
                            {item}
                        </div>
                    ))}
                </div>
            </div>,
            {width: 1910, height: 1000, fonts: []},
        );

        const leftImage = await getImageByAddress(leftAddress.toString());
        const rightImage = await getImageByAddress(rightAddress);

        const leftCharacter = await sharp(Buffer.from(leftImage.split(",")[1], 'base64'))
            .resize(1000, 1000)
            .extract({left: 200, top: 100, width: 600, height: 750})
            // .resize({height: 1000})
            .toBuffer();

        const rightCharacter = await sharp(Buffer.from(rightImage.split(",")[1], 'base64'))
            .resize(1000, 1000)
            .extract({left: 200, top: 100, width: 600, height: 750})
            // .resize({height: 1000})
            .toBuffer();

        const result = await sharp(logImage)
            .composite([
                {input: leftCharacter, left: 55, top: 100},
                {input: rightCharacter, left: 1255, top: 100},
            ])
            .toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.send(result);

    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
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

// BronzeRing T3
// SilverRing T2
// GoldRing T1
// PlatinumRing T1
// TitaniumRing T1
// Necklace T1
// Amulet  T1
// Pendant T1

const tier1 = ["Holy Chestplate", "Ancient Helm", "Ornate Belt", "Holy Greaves", "Holy Gauntlets", "Demon Husk", "Demon Crown", "Demonhide Belt", "Demonhide Boots", "Demons Hands", "Divine Robe", "Crown", "Brightsilk Sash", "Divine Slippers", "Divine Gloves", "Katana", "Warhammer", "Ghost Wand", "Grimoire", "Pendant", "Amulet", "Necklace", "Titanium Ring", "Platinum Ring", "Gold Ring"];
const tier2 = ["Ornate Chestplate", "Ornate Helm", "War Belt", "Ornate Greaves", "Ornate Gauntlets", "Dragonskin Armor", "Dragons Crown", "Dragonskin Belt", "Dragonskin Boots", "Dragonskin Gloves", "Silk Robe", "Divine Hood", "Silk Hood", "Silk Sash", "Silk Slippers", "Silk Gloves", "Falchion", "Quarterstaff", "Grave Wand", "Chronicle", "Silver Ring"];
const tier3 = ["Plate Mail", "Great Helm", "Plated Belt", "Greaves", "Gauntlets", "Studded Leather Armor", "War Cap", "Studded Leather Belt", "Studded Leather Boots", "Studded Leather Gloves", "Linen Robe", "Silk Sash", "Wool Sash", "Wool Shoes", "Wool Gloves", "Scimitar", "Maul", "Bone Wand", "Tome", "Bronze Ring"];
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

    let result = "<svg xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMinYMin meet\" viewBox=\"0 0 350 350\"> <style>    .base {        fill: rgb(255, 255, 255);        font-family: serif;        font-size: 14px;    }    .green {        fill: rgb(30, 255, 0);        font-family: serif;        font-size: 14px;    }    .blue {        fill: rgb(0, 112, 221);        font-family: serif;        font-size: 14px;    }    .purple {        fill: rgb(163, 53, 238);        font-family: serif;        font-size: 14px;    }    .orange {        fill: rgb(255, 128, 0);        font-family: serif;        font-size: 14px;    }</style><rect width=\"100%\" height=\"100%\" fill=\"black\" />";

    for (let i = 0; i < items.length; i++) {
        result += "<text x=\"10\" y=\"" + (i * 20 + 20).toString(10) + getLevelColor(items[i]);
    }

    return result + "</svg>";

}

async function getImageByAddress(address: string) {

    // todo optional: store the query results

    const sloot = new Contract(
        "0x869Ad3Dfb0F9ACB9094BA85228008981BE6DBddE",
        ["function tokenURI(address) public view returns (string)",],
        new JsonRpcProvider("https://rpc.mevblocker.io"));
    // console.log("sloot:", sloot);
    const tokenURIB64 = await sloot.tokenURI(address);
    // console.log("tokenUTIB64", tokenURIB64);
    const tokenURI = JSON.parse(Buffer.from(tokenURIB64.split(",")[1], 'base64').toString("utf8"))
    // console.log("tokenURI:", tokenURI);
    const b64svg = tokenURI.image;
    // console.log("b64svg:", b64svg);
    const svg = Buffer.from(b64svg.split(",")[1], 'base64').toString("utf8")
    // console.log("svg:", svg);

    const items = itemsFromSvg(svg)
    // console.log("items:", items)

    // const tokenURIWithColor = renderWithColors(items);
    // console.log("lootWithColor:", tokenURIWithColor);
    // const lootWithColor = "data:image/svg+xml;base64," + Buffer.from(tokenURIWithColor).toString('base64');

    return await getImageForLoot(items);

}


function generateLog(battleDetails: BattleDetail[], battle: Battle) {

    let result: string[] = [];

    if (battleDetails.length === 0) {
        return result;
    }

    battleDetails.sort((a, b) => a.order - b.order);
    for (let i = 0; i < battleDetails.length; i += 2) {

        const detail = battleDetails[i];

        // critical hit
        const randoms = detail.random.split(",");
        const critical = randoms.map((a: string) => Number.parseInt(a) > 95);

        const isAttack = i % 2 === 0;
        const attacker = isAttack ?
            (detail.friend === 1 ? battle.friendName : battle.attackerName) :
            battle.defenderName;
        const defender = isAttack ?
            battle.defenderName :
            (detail.friend === 1 ? battle.friendName : battle.attackerName);

        // []攻击了[]，造成了[]伤害 / 暴击造成了[]伤害
        result [i] = attacker +
            " attacked " +
            defender + "," +
            (critical[0] ? " critical hit " : " hit ") +
            "caused " +
            detail.damage;
        console.log("generate log:", battle.id, result);

    }

    return result;

}
