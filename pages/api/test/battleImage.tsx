import type { NextApiRequest, NextApiResponse } from 'next';
import { getImageByAddress } from "@/lootUtils";
import { Battle, BattleDetail, PrismaClient } from "@prisma/client";
import sharp from "sharp";
import satori from "satori";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method === 'GET') {
        
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
                <div style={ {fontFamily: "serif", fontSize: "13px", width: "600px", height: "800px", color: "white"} }>
                    { battleLog.map((item) => (
                        <div>
                            { item }
                        </div>
                    )) }
                </div>
            </div>,
            {width: 1910, height: 1000, fonts: [{data: Buffer.from(""), name: "serif"}]},
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
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
    
}


function generateLog(battleDetails: BattleDetail[], battle: Battle) {
    
    let result: string[] = [];
    
    if (battleDetails.length === 0) {
        return result;
    }
    
    battleDetails.sort((a, b) => a.order - b.order);
    for (let i = 0; i < battleDetails.length; i += 2) {
        
        const detail = battleDetails[i];
        
        const isAttack = i % 2 === 0;
        const attacker = isAttack ?
            (detail.friend ? detail.friendName : battle.attackerName) :
            battle.defenderName;
        const defender = isAttack ?
            battle.defenderName :
            (detail.friend ? detail.friendName : battle.attackerName);
        
        // []攻击了[]，造成了[]伤害 / 暴击造成了[]伤害
        result [i] = attacker +
            " attacked " +
            defender + "," +
            (detail.critical === 1 ? " critical hit " : " hit ") +
            "caused " +
            detail.damage;
        console.log("generate log:", battle.id, result);
        
    }
    
    return result;
    
}
