import type { NextApiRequest, NextApiResponse } from 'next';
import { getImageByAddress, getLevelColor } from "@/lootUtils";
import { Battle, BattleDetail, PrismaClient } from "@prisma/client";
import sharp from "sharp";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method === 'GET') {
        
        const diff = Number(req.query["cd"] || -1);
        if (diff > 0) {
            
            const result = await sharp(Buffer.from(
                `<svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
                   <style>    .base {        fill: rgb(255, 255, 255);        font-family: serif;        font-size: 70px;    }    </style>
                   <rect width="100%" height="100%" fill="black" />
                   <text x="100" y="500" class="base">Friend support points has run out, please wait ${ diff } minutes</text>
                   </svg>`
            )).toBuffer();
            
            res.setHeader('Content-Type', 'image/png');
            res.send(result);
            
        }
        
        const battleCD = Number(req.query["bcd"] || -1);
        if (battleCD > 0) {
            
            const result = await sharp(Buffer.from(
                `<svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
                   <style>    .base {        fill: rgb(255, 255, 255);        font-family: serif;        font-size: 70px;    }    </style>
                   <rect width="100%" height="100%" fill="black" />
                   <text x="100" y="500" class="base">You have defeated a guy, please wait for ${ battleCD } minutes</text>
                   </svg>`
            )).toBuffer();
            
            res.setHeader('Content-Type', 'image/png');
            res.send(result);
            
        }
        
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
        
        const leftAddress = req.query["address"] || battle.attacker;
        const rightAddress = battle.defender;
        
        const {battleLog, leftHealth, rightHealth} = generateLog(battleDetails, battle);
        
        const logImage = renderLog(battleLog);
        // console.log("logImage:", logImage);
        
        const leftImage = await getImageByAddress(leftAddress.toString());
        const rightImage = await getImageByAddress(rightAddress);
        
        const leftCharacter = await sharp(Buffer.from(leftImage.split(",")[1], 'base64'))
            .resize(1000, 1000)
            .extract({left: 200, top: 100, width: 600, height: 750})
            .composite([{
                input: {text: {text: leftHealth + "/1000", font: "serif", align: "centre", dpi: 250}},
                left: 200,
                top: 0
            }])
            // .resize({height: 1000})
            .toBuffer();
        
        const rightCharacter = await sharp(Buffer.from(rightImage.split(",")[1], 'base64'))
            .resize(1000, 1000)
            .extract({left: 200, top: 100, width: 600, height: 750})
            .composite([{
                input: {text: {text: rightHealth + "/1000", font: "serif", align: "centre", dpi: 250}},
                left: 200,
                top: 0
            }])
            // .resize({height: 1000})
            .toBuffer();
        
        const logDisplay = await sharp(Buffer.from(logImage))
            .resize(600, 800)
            .toBuffer();
        
        const result = await sharp(Buffer.from(
            `<svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
                   <rect width="100%" height="100%" fill="black" />
                   </svg>`
        ))
            .composite([
                {input: leftCharacter, left: 55, top: 100},
                {input: logDisplay, left: 655, top: 100},
                {input: rightCharacter, left: 1255, top: 100},
            ])
            .toBuffer();
        
        res.setHeader('Content-Type', 'image/png');
        res.send(result);
        
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
    
}


function generateLog(battleDetails: BattleDetail[], battle: Battle) {
    
    let battleLog: string[] = [];
    let leftHealth = 1000;
    let rightHealth = 1000;
    
    if (battleDetails.length === 0) {
        return {battleLog, leftHealth, rightHealth};
    }
    
    battleDetails.sort((a, b) => a.order - b.order);
    for (let i = 0; i < battleDetails.length; i++) {
        
        const detail = battleDetails[i];
        
        const isAttack = i % 2 === 0;
        const attacker = isAttack ?
            (detail.friend ? detail.friendName : battle.attackerName) :
            battle.defenderName;
        const defender = isAttack ?
            battle.defenderName :
            (detail.friend ? detail.friendName : battle.attackerName);
        
        // []攻击了[]，造成了[]伤害 / 暴击造成了[]伤害
        battleLog [i] = attacker +
            " attacked " +
            defender + "," +
            (detail.critical === 1 ? " critical hit " : " hit ") +
            "caused " +
            detail.damage +
            " damage";
        console.log("generate log:", battle.id, battleLog);
        
        if (isAttack) {
            rightHealth -= detail.damage;
        } else {
            leftHealth -= detail.damage;
        }
        
    }
    
    return {battleLog, leftHealth, rightHealth};
    
}

function renderLog(logs: string[]) {
    
    if (!logs) {
        return logs;
    }
    
    let result = "<svg xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMinYMin meet\" viewBox=\"0 0 300 400\"> <style>    .base {        fill: rgb(255, 255, 255);        font-family: serif;        font-size: 12px;    }    </style><rect width=\"100%\" height=\"100%\" fill=\"black\" />";
    
    for (let i = 0; i < logs.length; i++) {
        result += "<text x=\"10\" y=\"" + (i * 20 + 20).toString(10) + "\" class=\"base\"> " + logs[i] + "</text>";
    }
    
    return result + "</svg>";
    
}
