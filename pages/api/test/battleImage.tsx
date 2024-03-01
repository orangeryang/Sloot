import type { NextApiRequest, NextApiResponse } from 'next';
import {} from "satori";
import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import { getAddress } from "ethers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method === 'get') {
        
        let userAddress;
        let opponentAddress;
        try {
            userAddress = getAddress(req.query["address1"] as string);
            opponentAddress = getAddress(req.query["address2"] as string);
            console.log("generate battle img");
            console.log("userAddress:", userAddress);
            console.log("opponentAddress:", opponentAddress);
        } catch (e) {
            return res.status(400).send(`Failed to generate image: ${ e }`);
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
        
        const battleDetails = await prisma.battleDetail.findMany({
            where: {
                battleId: Number.parseInt(id.toString()),
            }
        })
        console.log("find battleDetails:", battleDetails);
        
        await prisma.$disconnect();
        
        
        
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
    
}
