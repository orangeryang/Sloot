import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method === 'GET') {
        
        const winner = Number.parseInt(req.query["win"]?.toString() || "-1");
        const userName = req.query["user"] || "";
        
        const result = winner === 1 ? "win" : "lose";
        
        const battleResult = await sharp(Buffer.from(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMinYMin meet\" viewBox=\"0 0 600 800\">\n" +
            "  <style>\n" +
            "    .base {\n" +
            "      fill: rgb(255, 255, 255);\n" +
            "      font-family: serif;\n" +
            "      font-size: 100px;\n" +
            "    }\n" +
            "  </style>\n" +
            "  <rect width=\"100%\" height=\"100%\" fill=\"black\" />\n" +
            "  <text x=\"100\" y=\"300\" class=\"base\"> \n" +
            "  You " + result + "!\n" +
            "  </text>\n" +
            "</svg>"
        )).png().toBuffer();
        
        res.setHeader('Content-Type', 'image/png');
        res.send(battleResult);
        
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
    
}
