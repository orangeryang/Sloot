import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";
import { Prisma, PrismaClient } from "@prisma/client";
import { CastParamType, NeynarAPIClient } from "@neynar/nodejs-sdk";

// @ts-ignore
const nClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method === 'GET') {
        
        const id = Number.parseInt(req.query["id"]?.toString() || "0");
        
        const prisma = new PrismaClient();
        
        const battle = await prisma.battle.findUnique({
            where: {
                id: Number.parseInt(id.toString()),
            }
        })
        console.log("find battle:", battle);
        
        let result = "";
        if (!battle) {
            console.warn("generate image: battle not found:", id);
        } else if (battle.winner < 0) {
            console.warn("generate board: battle not end yet:", id);
        } else {
            result = "You "
                + (battle.winner === 1 ? "win" : "lose")
                + " !\n";
        }
        
        const globalData = await prisma.$queryRaw`select attacker_name,count(attacker) as record from Battle where winner=1 group by attacker_name order by record desc limit 5;`;
        console.log("globalData:", globalData);
        
        const following = battle ?
            (await nClient.fetchUserFollowing(battle.attackerFid, {limit: 100}))
                .result.users
                .map((value: { fid: number; }) => {
                    console.log(value);
                    return value.fid;
                }) : null;
        console.log("following:", following);
        const friendData = (following && following.length > 0) ? await prisma.$queryRaw`select attacker_name, count(1) from Battle where winner = 1 and attacker_fid in (${Prisma.join(following)}) group by attacker_name limit 5` : [];
        console.log("friendData:", friendData);
        
        await prisma.$disconnect();
        
        const battleResult = await sharp(Buffer.from(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMinYMin meet\" viewBox=\"0 0 1910 1000\">\n" +
            "  <style>\n" +
            "    .base {\n" +
            "      fill: rgb(255, 255, 255);\n" +
            "      font-family: serif;\n" +
            "      font-size: 100px;\n" +
            "    }\n" +
            "  </style>\n" +
            "  <rect width=\"100%\" height=\"100%\" fill=\"black\" />\n" +
            "  <text x=\"300\" y=\"500\" class=\"base\"> \n" +
            result +
            "  </text>\n" +
            "</svg>"
        )).toBuffer();
        
        // const globalData =
        //     [{attackerName: "aaa", count: 666},
        //         {attackerName: "aaa", count: 666},
        //         {attackerName: "aaa", count: 666},
        //         {attackerName: "aaa", count: 666},
        //         {attackerName: "aaa", count: 666},
        //     ];
        //
        // const friendData =
        //     [{attackerName: "aaa", count: 666},
        //         {attackerName: "aaa", count: 666},
        //         {attackerName: "aaa", count: 666},
        //         {attackerName: "aaa", count: 666},
        //         {attackerName: "aaa", count: 666},
        //     ]
        
        const global = await sharp(Buffer.from(renderBoard(globalData as { attackerName: string, count: number }[])))
            .resize(1000, 500).toBuffer();
        // console.log("global:", global);
        const friend = await sharp(Buffer.from(renderBoard(friendData as { attackerName: string, count: number }[])))
            .resize(1000, 500).toBuffer();
        // console.log("friend:", friend);
        
        const final = await sharp(battleResult)
            .composite([
                {input: global, gravity: "northeast"},
                {input: friend, gravity: "southeast"}
            ]).png().toBuffer();
        
        res.setHeader('Content-Type', 'image/png');
        res.send(final);
        
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
    
}

function renderBoard(data: { attackerName: string, count: number }[]) {
    
    if (!data) {
        return data;
    }
    
    let result = "<svg xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMinYMin meet\" viewBox=\"0 0 500 250\"> <style>    .base {        fill: rgb(255, 255, 255);        font-family: serif;        font-size: 16px;    }    </style><rect width=\"100%\" height=\"100%\" fill=\"black\" />";
    
    for (let i = 0; i < data.length; i++) {
        result += "<text x=\"100\" y=\"" + ((i + 1) * 40).toString(10) + "\" class=\"base\"> " + data[i].attackerName + "  have  " + data[i].count + " defeated" + "</text>";
    }
    
    return result + "</svg>";
    
}
