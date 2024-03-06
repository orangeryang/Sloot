import type { NextApiRequest, NextApiResponse } from 'next';
import { CastParamType, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { PrismaClient } from "@prisma/client";
import { User, UserResponse } from "@neynar/nodejs-sdk/build/neynar-api/v1";
import { fetchQuery, init } from "@airstack/airstack-react";
import { getCounterRelation, getCriticalThreshold, getItemsByAddress, getPowerBoost, getTier } from "@/lootUtils";
import { startPage } from "@/pages/api/test/start";

// @ts-ignore
init(process.env.QUERY_KEY);
// @ts-ignore
const nClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // no cache in the first version here
    // I think it has to be done in the next version
    
    if (req.method === 'POST') {
        
        
        // validate the request and get the user's information
        
        let user;
        let buttonId;
        let opponentByInput = "";
        
        // console.log("req detail:", req.body);
        try {
            const result = await nClient.validateFrameAction(req.body?.trustedData?.messageBytes.toString(), {});
            // console.log("validate result:", result);
            if (result && result.valid) {
                user = result.action?.interactor;
                // @ts-ignore
                buttonId = result.action?.tapped_button.index;
                opponentByInput = result.action?.input?.text || "";
            }
        } catch (e) {
            console.warn("Failed to validate:", e);
            return res.status(400).send(`Failed to validate message: ${ e }`);
        }
        console.log("request info:", user);
        console.log("request opponent:", opponentByInput);
        
        let id = req.query["id"] || "";
        
        // jump to the page
        if (buttonId === 3) {
            
            console.log("Redirecting to gink");
            return res.status(302).setHeader('Location', 'https://warpcast.com/gink/0x67c737a3').send('Redirecting to query');
            
        }
        // battle action here
        else if (buttonId === 1) {
            
            let leftAddress = "";
            let leftName = "";
            let rightAddress = "";
            let rightName = "";
            let friendFlag = 0;
            let endBattle = 0;
            
            const prisma = new PrismaClient();
            let battle;
            let battleDetails;
            
            let opponentFid = 0;
            
            if (id) {
                
                // continue
                
                battle = await prisma.battle.findUnique({
                    where: {
                        id: Number.parseInt(id.toString()),
                    }
                })
                console.log("find battle:", battle);
                
                if (!battle) {
                    console.warn("generate image: battle not found:", id);
                    return res.status(400).send(`Failed to continue: battle not found`);
                }
                
                battleDetails = await prisma.battleDetail.findMany({
                    where: {
                        battleId: Number.parseInt(id.toString()),
                    }
                })
                console.log("find battleDetails:", battleDetails);
                
                leftName = battle.attackerName;
                leftAddress = battle.attacker;
                rightName = battle.defenderName;
                rightAddress = battle.defender;
                
                const friend = req.query["frid"] || "";
                const friendName = req.query["frna"] || "";
                if (friend) {
                    
                    // looking for friends' help
                    let friendAddress;
                    try {
                        friendAddress = await getAddressByFid(Number.parseInt(friend.toString()));
                        leftAddress = friendAddress;
                        leftName = friendName.toString();
                        friendFlag = 1;
                    } catch (e) {
                        console.warn("Failed to lookup friend address:", friend);
                    }
                    
                }
                
            } else {
                
                // find the opponent to start the battle
                
                try {
                    
                    if (opponentByInput) {
                        const opponentResponse: UserResponse =
                            await nClient.lookupUserByUsername(
                                opponentByInput.startsWith("@") ?
                                    opponentByInput.slice(1, opponentByInput.length) : opponentByInput);
                        opponentFid = opponentResponse.result.user.fid;
                        rightName = opponentResponse.result.user.username;
                    } else {
                        // @ts-ignore
                        opponentFid = getRandomFid(user.fid);
                        const userResponsePromise: UserResponse = await nClient.lookupUserByFid(opponentFid);
                        console.log(userResponsePromise);
                        rightName = userResponsePromise.result.user.username;
                    }
                    leftAddress = await getAddressByFid(user?.fid || 0);
                    leftName = user?.username || "";
                    rightAddress = await getAddressByFid(opponentFid);
                    
                    console.log("rightName:", rightName);
                    console.log("rightAddress:", rightAddress);
                    
                } catch (e) {
                    console.warn("Failed to lookup opponent:", opponentByInput);
                    console.warn("Error:", e);
                }
                
                if (!rightAddress) {
                    console.warn("Failed to lookup opponent address:", rightAddress);
                    return res.status(400).send("Failed to find opponent");
                }
                
            }
            
            // battle detail
            console.log("left attack right:");
            const attackResult = await attackOnce(leftAddress, rightAddress);
            console.log("right attack left");
            const defenceResult = await attackOnce(rightAddress, leftAddress);
            
            let winner = -1;
            
            if (!battle) {
                
                battle = await prisma.battle.create({
                    data: {
                        attacker: leftAddress,
                        attackerFid: user?.fid || 0,
                        attackerName: leftName,
                        defender: rightAddress,
                        defenderFid: opponentFid,
                        defenderName: rightName,
                    }
                });
                console.log("create battle:", battle);
                
                battleDetails = await prisma.battleDetail.createMany({
                    data: [
                        {
                            battleId: battle.id,
                            order: 0,
                            random: attackResult.random,
                            critical: attackResult.criticalFlag,
                            damage: attackResult.totalDamage,
                        },
                        {
                            battleId: battle.id,
                            order: 1,
                            random: defenceResult.random,
                            critical: defenceResult.criticalFlag,
                            damage: defenceResult.totalDamage,
                        }
                    ],
                });
                console.log("create battleDetails:", battleDetails);
                
                id = battle.id.toString();
                
            } else {
                
                // @ts-ignore
                const leftLost = battleDetails
                        .filter((a) => (a.order % 2 === 0))
                        .map((a) => a.damage)
                        .reduce((a, b) => a + b, 0)
                    + attackResult.totalDamage;
                // @ts-ignore
                const rightLost = battleDetails
                        .filter((a) => !(a.order % 2 === 0))
                        .map((a) => a.damage)
                        .reduce((a, b) => a + b, 0)
                    + defenceResult.totalDamage;
                
                if (leftLost >= 1000) {
                    winner = 0;
                } else if (rightLost >= 1000) {
                    winner = 1;
                }
                
                // @ts-ignore
                const order = Math.max(...(battleDetails.map((a) => a.order)));
                battleDetails = await prisma.battleDetail.createMany({
                    data: [
                        {
                            battleId: battle.id,
                            order: order + 1,
                            random: attackResult.random,
                            critical: attackResult.criticalFlag,
                            damage: attackResult.totalDamage,
                            friend: friendFlag === 1 ? leftAddress : "",
                            friendName: friendFlag === 1 ? leftName : ""
                        },
                        {
                            battleId: battle.id,
                            order: order + 2,
                            random: defenceResult.random,
                            critical: defenceResult.criticalFlag,
                            damage: defenceResult.totalDamage,
                            friend: friendFlag === 1 ? leftAddress : "",
                            friendName: friendFlag === 1 ? leftName : ""
                        }
                    ],
                });
                console.log("create battleDetails:", battleDetails);
                
                if (winner !== -1) {
                    await prisma.battle.update({
                        where: {
                            id: battle.id
                        },
                        data: {
                            winner: winner
                        }
                    });
                    console.log("update battle:", battle);
                    endBattle = 1;
                }
                
            }
            
            await prisma.$disconnect();
            
            
            res.setHeader('Content-Type', 'text/html');
            if (endBattle === 1) {
                res.status(200).send(`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title> My SLoot </title>
                      <meta property="og:title" content="Synthetic Loot">
                      <meta property="og:image" content="${ process.env['HOST'] }/1.png">
                      <meta name="fc:frame" content="vNext">
                      <meta name="fc:frame:image"
                      content="${ process.env['HOST'] }/api/${ process.env['APIPATH'] }/board?winner=${ winner }&id=${ id }">
                    </head>
                  </html>
                `);
            } else {
                res.status(200).send(battlePage(id));
            }
            
        }
        // friends here
        else if (buttonId === 2) {
            // @ts-ignore
            const {fr1, fr2, fr3, frna1, frna2, frna3} = await findFriend(user.fid);
            
            const imageUrl = `${ process.env['HOST'] }/api/${ process.env['APIPATH'] }/battleImage?id=${ id }`;
            const contentUrl = `${ process.env['HOST'] }/api/${ process.env['APIPATH'] }/friend?id=${ id }`;
            
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(`
                 <title> My SLoot </title>
                      <meta property="og:title" content="Synthetic Loot">
                      <meta property="og:image" content="${ process.env['HOST'] }/1.png">
                      <meta name="fc:frame" content="vNext">
                      <meta name="fc:frame:image" content="${ imageUrl }">
                      <meta name="fc:frame:post_url" content="${ contentUrl }">
                      ${ frna1 ? `<meta name="fc:frame:button:1" content="${ frna1 }">` : '' }
                      ${ frna2 ? `<meta name="fc:frame:button:2" content="${ frna2 }">` : '' }
                      ${ frna3 ? `<meta name="fc:frame:button:3" content="${ frna3 }">` : '' }
                      <meta name="fc:frame:button:4" content="back">
            `);
            
        }
        // escape
        else if (buttonId === 4) {
            
            console.log("escape from battle:", user);
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(startPage());
            
        }
        
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${ req.method } Not Allowed`);
    }
    
}

async function getAddressByFid(opponentFid: number) {
    // user address
    const {data, error} = await fetchQuery("query MyQuery {\n" +
        "  Socials(\n" +
        "    input: {filter: {dappName: {_eq: farcaster}, identity: {_eq: \"fc_fid:" +
        opponentFid.toString(10) +
        "\"}}, blockchain: ethereum}\n" +
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
        "}");
    
    // console.log("fetch data:", data, error);
    if (!data) {
        return "";
    }
    const social = data.Socials.Social;
    // console.log("Social:", Social);
    let addArrToRemove: string[] = [];
    for (let i = 0; i < social.length; i++) {
        // console.log(Social[i].userAddress);
        addArrToRemove.push(social[i].userAddress);
    }
    const address = social[0].userAssociatedAddresses.filter((add: string) => !addArrToRemove.includes(add));
    if (address.length === 0) {
        address[0] = social[0].userAddress;
    }
    
    
    console.log("address:", address);
    return address[0];
}

async function attackOnce(leftAddress: string, rightAddress: string) {
    const left = await getItemsByAddress(leftAddress)
    const right = await getItemsByAddress(rightAddress)
    
    const weapon = left[0];
    const attackPower = 20 * (6 - getTier(weapon));
    console.log("weapon:", weapon, " attackPower:", attackPower);
    
    let random = "";
    let criticalFlag = 0;
    let totalDamage = 0;
    
    // ring buff
    let criticalThreshold = getCriticalThreshold(left[7]);
    let powerBoost = getPowerBoost(left[7]);
    
    for (let i = 1; i < 6; i++) {
        
        const armor = right[i];
        const defensePower = 20 * (6 - getTier(armor));
        console.log("armor:", armor, " defensePower:", defensePower);
        
        const critical = Math.random();
        const damage =
            // basic attack power
            (attackPower + powerBoost)
            // counter relation
            * getCounterRelation(weapon, armor)
            // critical
            * (critical > criticalThreshold ? 2 : 1)
            // defense power
            - defensePower;
        console.log("critical:", critical, " damage:", damage);
        
        if (damage > 0) {
            totalDamage += damage;
        }
        if (critical > criticalThreshold) {
            criticalFlag = 1;
        }
        random += critical + ",";
        
    }
    
    return {
        totalDamage,
        criticalFlag,
        random
    };
}


function getRandomFid(origin: number) {
    
    const current = new Date().getTime();
    return origin - current % origin;
    
}

export async function findFriend(fid: number) {
    
    let list: string[] = [];
    try {
        
        let records: number[] = [];
        // @ts-ignore
        const feed = await nClient.fetchRepliesAndRecastsForUser(fid, {limit: 10});
        feed.casts.map(cast => {
            cast.reactions.likes.forEach(value => {
                records[value.fid] = (records[value.fid] || 0) + 1;
            });
            cast.reactions.recasts.forEach(value => {
                records[value.fid] = (records[value.fid] || 0) + 1;
            })
        })
        list = Object.keys(records)
            .sort((a, b) => records[Number(b)] - records[Number(a)])
            .slice(0, 3);
        
    } catch (e) {
        console.warn("fetch recasts and likes error:", e);
    }
    
    console.log("friend list:", list);
    const fr1 = Number(list[0]);
    const fr2 = Number(list[1]);
    const fr3 = Number(list[2]);
    
    const frna1 = fr1 ? (await nClient.lookupUserByFid(fr1)).result.user.username : "";
    const frna2 = fr2 ? (await nClient.lookupUserByFid(fr2)).result.user.username : "";
    const frna3 = fr3 ? (await nClient.lookupUserByFid(fr3)).result.user.username : "";
    
    return {fr1, fr2, fr3, frna1, frna2, frna3};
    
}


export function battlePage(id: string | string[]) {
    
    const imageUrl =
        `${ process.env['HOST'] }/api/${ process.env['APIPATH'] }/battleImage?id=${ id }`;
    console.log("imageUrl:", imageUrl);
    
    const contentUrl =
        `${ process.env['HOST'] }/api/${ process.env['APIPATH'] }/battle?id=${ id }`;
    console.log("contentUrl:", contentUrl);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <title> My SLoot </title>
    <meta property="og:title" content="Synthetic Loot">
        <meta property="og:image" content="${ process.env['HOST'] }/1.png">
            <meta name="fc:frame" content="vNext">
                <meta name="fc:frame:image" content="${ imageUrl }">
                    <meta name="fc:frame:post_url" content="${ contentUrl }">
                        <meta name="fc:frame:button:1" content="Attack">
                            <meta name="fc:frame:button:2" content="Friends">
                                <meta name="fc:frame:button:3" content="Query Loot">
                                    <meta name="fc:frame:button:3:action" content="post_redirect">
                                        <meta name="fc:frame:button:4" content="Escape">
                                        </head>
                                    </html>
                                    `;
}
