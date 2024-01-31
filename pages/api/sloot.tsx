import type { NextApiRequest, NextApiResponse } from 'next';
import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import sharp from 'sharp';
import satori from "satori";
import { ethers, JsonRpcProvider, Contract } from "ethers";
import SyntheticLootArtifact from "../../public/SyntheticLoot.json";
import map from "../../public/map.json";
import { itemsFromSvg, getImageForLoot } from "@/app/sloot/loot-utils";

const HUB_URL = "nemes.farcaster.xyz:2283";
const client = getSSLHubRpcClient(HUB_URL);
const IMG_DIR = `ipfs://${ map.ipfs.character_imgs }`;
import { init, useQuery } from "@airstack/airstack-react";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        init("117baaa0c425643f699cd5324983903fa");
        
        try {
            let validatedMessage: Message | undefined = undefined;
            // console.log("req:", req);
            try {
                const frameMessage = Message.decode(Buffer.from(req.body?.trustedData?.messageBytes || '', 'hex'));
                const result = await client.validateMessage(frameMessage);
                if (result.isOk() && result.value.valid) {
                    validatedMessage = result.value.message;
                }
            } catch (e) {
                return res.status(400).send(`Failed to validate message: ${ e }`);
            }
            
            const buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
            const fid = validatedMessage?.data?.fid || 0;
            console.log("validatedMessage:" + validatedMessage?.data);
            if (buttonId != 1) {
                res.status(500).send("Invalid button");
            }
            
            useQuery("query MyQuery($_eq: SocialDappName, $_eq1: Identity, $blockchain: Blockchain!) {\n" +
                "  Socials(\n" +
                "    input: {filter: {dappName: {_eq: $_eq}, identity: {_eq: $_eq1}}, blockchain: $blockchain}\n" +
                "  ) {\n" +
                "    Social {\n" +
                "      id\n" +
                "      chainId\n" +
                "      blockchain\n" +
                "      dappName\n" +
                "      dappSlug\n" +
                "      dappVersion\n" +
                "      userId\n" +
                "      userAddress\n" +
                "      userCreatedAtBlockTimestamp\n" +
                "      userCreatedAtBlockNumber\n" +
                "      userLastUpdatedAtBlockTimestamp\n" +
                "      userLastUpdatedAtBlockNumber\n" +
                "      userHomeURL\n" +
                "      userRecoveryAddress\n" +
                "      userAssociatedAddresses\n" +
                "      profileName\n" +
                "      profileTokenId\n" +
                "      profileTokenAddress\n" +
                "      profileCreatedAtBlockTimestamp\n" +
                "      profileCreatedAtBlockNumber\n" +
                "      profileLastUpdatedAtBlockTimestamp\n" +
                "      profileLastUpdatedAtBlockNumber\n" +
                "      profileTokenUri\n" +
                "      isDefault\n" +
                "      identity\n" +
                "    }\n" +
                "  }\n" +
                "}", {fid: fid}, {cache: false});
            
            const address = validatedMessage?.signer;
            console.log("address:", address);
            if (!address) {
                res.status(500).send("No address");
            }
            const sloot = new Contract("0x869Ad3Dfb0F9ACB9094BA85228008981BE6DBddE", ["function tokenURI(address) public view returns (string)",], new JsonRpcProvider("https://rpc.mevblocker.io"));
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
            const img = await getImageForLoot(items)
            console.log("img:", img)
            
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
            
            // Set the content type to PNG and send the response
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'max-age=10');
            res.send(pngBuffer);
            
        } catch (error) {
            console.error(error);
            res.status(500).send('Error generating image');
        }
        
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
}

