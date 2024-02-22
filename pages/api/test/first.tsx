import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // console.info("req:", req);
    const headers = req.headers["user-agent"] || "";
    console.log("headers:", headers);
    
    if (headers && (headers.includes("Mozilla") || headers.includes("Chrome") || headers.includes("Safari") || headers.includes("Firefox") || headers.includes("Edg") || headers.includes("OPR")) || headers.includes("AppleWebKit")) {
        console.log("Browser, redirecting to loot");
        
        res.redirect("https://www.lootproject.com/");
        // redirect("https://google.com")
        // return NextResponse.redirect("https://www.google.com");
        
        // const router = useRouter();
        // router.push("https://google.com");
        
    } else {
        console.log("FC Bot");
        
        let buttonText = "Reveal your sLoot";
        let imageUrl = `${ process.env['HOST'] }/1.png`;
        let inputText = "Address or ENS here";
        
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            
            <head>
                <title> My SLoot </title>
                <meta property="og:title" content="Synthetic Loot">
                <meta property="og:image" content="${ imageUrl }">
                <meta name="fc:frame" content="vNext">
                <meta name="fc:frame:image" content="${ imageUrl }">
                <meta name="fc:frame:post_url" content="${ process.env['HOST'] }/api/${ process.env['APIPATH'] }/detail">
                <meta name="fc:frame:button:1" content="${ buttonText }">
                <meta name="fc:frame:input:text" content="${ inputText }">
            </head>

            <body>
                <h1> My Synthetic Loot </h1>
                <div style={imageUrl}>
                </div>
            </body>
            
            </html>
        `);
        
    }
}
