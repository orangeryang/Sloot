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
import { init, fetchQuery } from "@airstack/airstack-react";
import { useState } from "react";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title> My SLoot </title>
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="https://sloot-five.vercel.app/api/sloot">
          <meta name="fc:frame:button:1" content="Loot Foundation">
          <meta name="fc:frame:button:1:action" content="redirect">
          <meta name="fc:frame:button:1:url" content="https://loot.foundation/" />
          <meta name="fc:frame:button:2" content="Loot Discord">
          <meta name="fc:frame:button:2:action" content="redirect">>
          <meta name="fc:frame:button:2:url" content="https://loot.foundation/" />
          <meta name="fc:frame:button:3" content="Buy Loot">
          <meta name="fc:frame:button:3:action" content="redirect">>
          <meta name="fc:frame:button:3:url" content="https://loot.foundation/" />
          <meta name="fc:frame:button:4" content="Play Loot Survivor">
          <meta name="fc:frame:button:4:action" content="redirect">>
          <meta name="fc:frame:button:4:url" content="https://loot.foundation/" />
        </head>
      </html>
    `);
    
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
}

