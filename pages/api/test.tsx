import { ethers, JsonRpcProvider } from "ethers";
import SyntheticLootArtifact from "@/public/SyntheticLoot.json";
import { getImageForLoot, itemsFromSvg } from "@/app/sloot/loot-utils";
import satori from "satori";
import sharp from "sharp";

async function main() {
    const sloot = new ethers.Contract("0x869ad3dfb0f9acb9094ba85228008981be6dbdde", SyntheticLootArtifact, new JsonRpcProvider("https://rpc.mevblocker.io"));
    
    const tokenURIB64 = await sloot.tokenURI("0x196a70ac9847d59e039d0cfcf0cde1adac12f5fb447bb53334d67ab18246306c");
    const tokenURI = JSON.parse(Buffer.from(tokenURIB64.split(",")[1], 'base64').toString("utf8"));
    const b64svg = tokenURI.image;
    const svg = Buffer.from(b64svg.split(",")[1], 'base64').toString("utf8")
    
    const items = itemsFromSvg(svg)
    console.log(items)
    const img = await getImageForLoot(items)
    console.log(img)
    
    const satoriSvg = await satori(<div className="card"
                                        style={ {backgroundColor: "white", marginTop: "15px"} }>
        <img alt="character" style={ {borderRadius: "5px", width: "100%"} }
             src={ img }/>
        <ul style={ {marginLeft: "-20px"} }>
            { items.map(item => {
                return <li key={ item }>{ item }</li>
            }) }
        </ul>
    </div>, {width: 600, height: 400, fonts: []});
    
    const pngBuffer = await sharp(Buffer.from(satoriSvg))
        .toFormat('png')
        .toBuffer();
    
    console.log(pngBuffer);
    
}

main().then();
